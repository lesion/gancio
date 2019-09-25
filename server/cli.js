#!/usr/bin/env node
process.env.NODE_ENV = 'production'

const fs = require('fs')
const consola = require('consola')
const sequelize = require('sequelize')
const inquirer = require('inquirer')
const package = require('../package.json')
const firstrun = require('./firstrun')
const path = require('path')
const mkdirp = require('mkdirp')

const cwd = process.cwd()

// needed by nuxt
process.chdir(path.resolve(__dirname, '..'))

function notEmpty (value) {
  return value.length>0
}

async function setupQuestionnaire(is_docker, db) {

  const questions = []
  questions.push({
    name: 'title',
    message: 'Name of your instance',
    default: 'Gancio',
    validate: notEmpty
  })

  questions.push({
    message: 'Specify a baseurl for this gancio installation! (eg. http://gancio.cisti.org)',
    name: 'baseurl',
    default: 'http://localhost:13120',
    validate: value => {
      if (!value) return false
      return /^https?:\/\//.test(value)
    }
  })

  questions.push({
    name: 'server.host',
    message: 'address to listen to',
    default: is_docker ? '0.0.0.0' : 'localhost',
    validate: notEmpty
  })

  questions.push({
    name: 'server.port',
    message: 'port to listen to',
    default: 13120,
  })

  questions.push({
    name: 'db.dialect',
    message: 'DB dialect',
    type: 'list',
    when: answers => !db,
    choices: ['sqlite', 'postgres']
  })

  questions.push({
    name: 'db.storage',
    message: 'sqlite db path',
    default: is_docker ? '/opt/gancio/db.sqlite' : './db.sqlite',
    filter: p => path.resolve(cwd, p),
    when: answers => ((db && db==='sqlite') || (answers.db && answers.db.dialect === 'sqlite')) && !is_docker,
    validate: db_path => db_path.length>0 && fs.existsSync(path.dirname(db_path))
  })

  questions.push({
    name: 'db.host',
    message: 'Postgres host',
    default: is_docker ? 'db' : 'localhost',
    when: answers => ((db && db==='postgresql') || (answers.db && answers.db.dialect === 'postgres')) && !is_docker,
    validate: notEmpty
  })

  questions.push({
    name: 'db.database',
    message: 'DB name',
    default: 'gancio',
    when: answers => (db && db==='postgresql') || (answers.db && answers.db.dialect === 'postgres'),
    validate: notEmpty
  })
    
  questions.push({
    name: 'db.username',
    message: 'DB user',
    default: 'gancio',
    when: answers => (db && db==='postgresql') || (answers.db && answers.db.dialect === 'postgres'),
    validate: notEmpty
  })
  
  questions.push({
    name: 'db.password',
    type: 'password',
    message: 'DB password',
    default: 'gancio',
    when: answers => (db && db==='postgresql') || (answers.db && answers.db.dialect === 'postgres'),
    validate: async (password, options) => {
      try {
        const db = new sequelize({ ...options.db, dialect: 'postgres' , password, logging: false })
        return db.authenticate().then( () => {
          db.close()
          return true
        })
      } catch(e) {
        consola.error(e)
        return false
      }
    }
  })

  questions.push({
    name: 'upload_path',
    message: 'Where gancio has to store media?',
    default: is_docker ? '/opt/gancio/uploads' : './uploads',
    when: answers => !is_docker,
    filter: p => path.resolve(cwd, p),
    validate: async p => {
      let exists =  fs.existsSync(p)
      if (!exists) {
        consola.warn(`"${p}" does not exists, trying to create it`)
        try {
          mkdirp.sync(p)
        } catch(e) {
          console.error(String(e))
          return false
        }
      }
      return true
    }
  })

  questions.push({
    name: 'admin.email',
    message: `Admin email (a first user with this username will be created)`,
    default: options => {
      return options.title.replace(' ', '').toLowerCase() + '@' + options.baseurl
    },
    validate: notEmpty
  })
  
  questions.push({
    name: 'admin.password',
    message: 'Admin password',
    type: 'password',
    validate: notEmpty
  })

  questions.push({
    name: 'smtp.host',
    message: 'SMTP Host',
    validate: notEmpty,
  })

  questions.push({
    name: 'smtp.auth.user',
    message: 'SMTP User',
    validate: notEmpty,
    default: options => options.admin.email
  })

  questions.push({
    name: 'smtp.auth.pass',
    message: 'SMTP Password',
    type: 'password',
    validate: notEmpty,
  })

  const answers = await inquirer.prompt(questions)
  return answers
}

async function upgrade (options) {
  const Umzug = require('umzug')
  const Sequelize = require('sequelize')
  const config = require('config')
  const db = new Sequelize(config.db)
  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: { sequelize: db },
    migrations: {
      wrap: fun => {
        return () => fun(db.queryInterface, Sequelize).catch(() => false)
     },
     path: path.resolve(__dirname, 'migrations')
    }
  })
  const migrations = await umzug.up()
  db.close()
}


async function start (options) {
  // is first run?
  if (firstrun.check(options.config)) {
    if (options.docker) {
      consola.error('Something goes wrong, did you run "docker-compose run --rm gancio gancio setup"')
      process.exit(-1)
    }
    consola.error(`Configuration file "${options.config}" not found! Use "--config <CONFIG_FILE.json>" to specify another path.
If this is your first run use 'gancio setup --config <CONFIG_FILE.json>' `)
    process.exit(-1)
  }
  await upgrade(options)
  require('./index')
}

async function setup (options) {
  consola.info(`You're going to setup gancio on this machine.`)
  const config = await setupQuestionnaire(options.docker, options.db)
  const ret = await firstrun.setup(config, options.config)
  if (!ret) process.exit(-1)
  if (options.docker) {
    consola.info(`You can edit ./config.json to modify your configuration.`)
    consola.info(`Start the server with "docker-compose up"`)
  } else {
    consola.info(`You can edit '${options.config}' to modify your configuration. `)
    consola.info(`Start the server with "gancio --config ${options.config}"`)
  }
  process.exit(0)
}

consola.info(`${package.name} - v${package.version} - ${package.description}`)

require('yargs')
.usage('Usage $0 <command> [options]')
.option('docker', {
  alias: 'd',
  describe: 'Inside docker',
  default: false,
  type: 'boolean'
})
.option('db', {
  describe: 'Specify db type',
})
.option('config', {
  alias: 'c',
  describe: 'Configuration file',
  default: '/opt/gancio/config.json',
})
.coerce('config', config_path => {
  const absolute_config_path = path.resolve(cwd, config_path)
  process.env.config_path = absolute_config_path
  return absolute_config_path
})
.command(['start', 'run', '$0'], 'Start gancio', {}, start)
.command('setup', 'Setup a new instance', {}, setup)
.help('h')
.alias('h', 'help')
.epilog('Made with ❤ by underscore hacklab - https://gancio.org')
.argv
