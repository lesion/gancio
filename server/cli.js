#!/usr/bin/env node
process.env.NODE_ENV = 'production'

const fs = require('fs')
const consola = require('consola')
const sequelize = require('sequelize')
const inquirer = require('inquirer')
const package = require('../package.json')
const firstrun = require('./firstrun')
const path = require('path')

const cwd = process.cwd()

// needed by nuxt
process.chdir(path.resolve(__dirname, '..'))

function notEmpty (value) {
  return value.length>0
}

async function setupQuestionnaire() {

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
    validate: notEmpty
  })

  questions.push({
    name: 'server.host',
    message: 'address to listen to',
    default: 'localhost',
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
    choices: ['sqlite', 'postgres']
  })

  questions.push({
    name: 'db.storage',
    message: 'sqlite db path',
    default: './db.sqlite',
    filter: p => path.resolve(cwd, p),
    when: answers => answers.db.dialect === 'sqlite',
    validate: db_path => db_path.length>0 && fs.existsSync(path.dirname(db_path))
  })

  questions.push({
    name: 'db.host',
    message: 'Postgres host',
    default: 'localhost',
    when: answers => answers.db.dialect === 'postgres',
    validate: notEmpty
  })

  questions.push({
    name: 'db.database',
    message: 'DB name',
    default: 'gancio',
    when: answers => answers.db.dialect === 'postgres',
    validate: notEmpty
  })
    
  questions.push({
    name: 'db.username',
    message: 'DB user',
    default: 'gancio',
    when: answers => answers.db.dialect === 'postgres',
    validate: notEmpty
  })
  
  questions.push({
    name: 'db.password',
    type: 'password',
    message: 'DB password',
    default: 'gancio',
    when: answers => answers.db.dialect === 'postgres',
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
    default: './uploads',
    filter: p => path.resolve(cwd, p),
    validate: p => {
      const exists =  fs.existsSync(p)
      if (!exists) consola.warn(`"${p}" does not exists, please create it`)
      return exists
    }
  })

  questions.push({
    name: 'admin.email',
    message: `Admin email (a first user with this username will be created)`,
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

async function start (options) {
  // is first run?
  if (firstrun.check(options.config)) {
    consola.error(`Configuration file "${options.config}" not found! 
This is your first run? You could create it using --install flag`)
    process.exit(-1)
  }
  require('./index')
}

async function setup (options) {
  consola.info(`You're going to setup gancio on this machine.`)
  const config = await setupQuestionnaire()
  await firstrun.setup(config, options.config)
  consola.info(`You can edit '${options.config}' to modify your configuration. `)
  consola.info(`Run "gancio --config ${options.config}"`)
  process.exit(0)  
}

async function upgrade (options) {
  consola.warn('Not implemented yet but should be an easy task! PR welcome!')
  process.exit(-1)
}

consola.info(`${package.name} - v${package.version} - ${package.description}`)

require('yargs')
.usage('Usage $0 <command> [options]')
.option('config', { 
  alias: 'c',
  describe: 'Configuration file',
  default: './gancio_config.json',
})
.coerce('config', config_path => {
  const absolute_config_path = path.resolve(cwd, config_path)
  process.env.config_path = absolute_config_path
  return absolute_config_path
})
.command(['start', 'run', '$0'], 'Start gancio', {}, start)
.command('setup', 'Setup a new instance', {}, setup)
.command('upgrade', 'Upgrade gancio to a new release (interactive)', {}, upgrade)
.help('h')
.alias('h', 'help')
.epilog('Made with ❤ by underscore hacklab - https://autistici.org/underscore')
.argv
