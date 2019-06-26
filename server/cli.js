#!/usr/bin/env node
process.env.NODE_ENV = "production"
const path = require('path')
const cwd = process.cwd()

// needed by nuxt
process.chdir(path.resolve(__dirname, '..'))

const arg = require('arg')
const inquirer = require('inquirer')
const package = require('../package.json')
const consola = require('consola')
const firstrun = require('./firstrun')
const fs = require('fs')
const sequelize = require('sequelize')

/**
 * initial setup:
 * - check first run
 * - ask title, description, baseurl
 * - ask and create upload path and thumb dir
 * - ask and inizialite db
 * - create first admin account
 * - enable open registration?
 * - enable anon event?
 * - enable email export?
 * - enable email notification?
 * - enable notifier?
 * - enable pm2
 * 
 * start gancio:
 * 
 * update gancio:
 * - yarn/npm global update...
 * - sequelize migrate ! 
 */

function parseArguments(rawArgs) {
  const args = arg({
    '--config': String,
    '--install': Boolean,
    '--upgrade': Boolean
  }, {
    argv: rawArgs.slice(2),
  });

  return {
    config: path.resolve(cwd, args['--config'] || '/etc/gancio_config.json') ,
    install: args['--install'] || false,
    upgrade: args['--upgrade'] || false
  };
}

function notEmpty (value) {
  return value.length>0
}

async function setupQuestionnaire() {

  const questions = []
  questions.push({
    message: 'Specify a baseurl for this gancio installation! (eg. http://gancio.cisti.org)',
    name: 'baseurl',
    default: 'http://localhost:3000',
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
    default: '/var/gancio/db.sqlite',
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
          // consola.info(`DB connected`)
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
    default: '/var/gancio/',
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

async function cli(args) {
  
  const options = parseArguments(args)
  consola.info(`${package.name} - v${package.version} - ${package.description}`)

  // install flag specified?
  if (options.install) {
    consola.info(`Cool! You're going to setup gancio on this machine.`)
    const config = await setupQuestionnaire()
    await firstrun.setup(config, options.config)
    consola.info(`You can edit '${options.config}' to modify your configuration. `)
    consola.info(`- Run "gancio --config ${options.config}"`)
    process.exit(0)
  }
  
  // upgrade gancio / TODO npm/yarn global upgrade gancio ?
  if (options.upgrade) {
    consola.warn('Not implemented yet but should be an easy task! PR welcome!')
    process.exit(-1)
  }

  // is first run?
  if (firstrun.check(options.config)) {
    consola.error(`Configuration file "${options.config}" not found! 
This is your first run? You could create it using --install flag`)

    process.exit(-1)
  } else {
    process.env.config_path = options.config
    require('./index')
  }

}

cli(process.argv)
