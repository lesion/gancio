#!/usr/bin/env node
const arg = require('arg')
const inquirer = require('inquirer')
const package = require('../package.json')
const consola = require('consola')
const firstrun = require('./firstrun')
const path = require('path')
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
    config: path.resolve(args['--config'] || '/etc/gancio_config.json') ,
    install: args['--install'] || false,
    upgrade: args['--upgrade'] || false
  };
}

async function setupQuestionnaire() {

  const questions = []
  questions.push({
    message: 'Specify a baseurl for this gancio installation! (eg. http://gancio.cisti.org)',
    name: 'baseurl',
    default: 'http://localhost:3000',
    validate: baseurl => baseurl.length>0
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
    when: answers => answers.db.dialect === 'sqlite',
    validate: db_path => db_path.length>0 && fs.existsSync(path.dirname(db_path))
  })

  questions.push({
    name: 'db.user',
    message: 'Postgres user',
    default: 'gancio',
    when: answers => answers.db.dialect === 'postgres',
    validate: user => user.length>0
  })
  
  questions.push({
    name: 'db.pass',
    type: 'password',
    message: 'Postgres password',
    default: 'gancio',
    when: answers => answers.db.dialect === 'postgres',
    validate: async (password, options) => {
      try {
        const db = new sequelize({host: 'localhost', dialect: 'postgres', database: 'gancio', username: options.db.user, password })
        return db.authenticate().then( () => {
          consola.info(`DB connected`)
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
    validate: (p) => {
      const exists =  fs.existsSync(p)
      if (!exists) consola.warn(`"${p}" does not exists, please create it`)
      return exists
    }
  })

  questions.push({
    name: 'admin.email',
    message: `Admin email (a first user with this username will be created)`,
    validate: email => email.length>0
  })
  
  questions.push({
    name: 'admin.password',
    message: 'Admin password',
    type: 'password',
    validate: password => password.length>0
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
    consola.info(`This is your configuration, run "gancio --install" or edit ${options.config} to modify it: `)
    consola.info(JSON.stringify(config, null, 2))
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
    require('./index')
  }

}

cli(process.argv)
