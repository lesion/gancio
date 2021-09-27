#!/usr/bin/env node
process.env.NODE_ENV = 'production'

const pkg = require('../package.json')
const path = require('path')

const cwd = process.cwd()
const data_path = process.env.GANCIO_DATA || path.resolve('./')

// needed by nuxt
// process.chdir(path.resolve(__dirname, '..'))

// async function run_migrations (db_conf) {
//   const Umzug = require('umzug')
//   const Sequelize = require('sequelize')
//   try {
//     const db = new Sequelize(db_conf)
//     const umzug = new Umzug({
//       storage: 'sequelize',
//       storageOptions: { sequelize: db },
//       logging: consola.info,
//       migrations: {
//         wrap: fun => {
//           return () =>
//             fun(db.queryInterface, Sequelize).catch(e => {
//               consola.error(e)
//               return false
//             })
//         },
//         path: path.resolve(__dirname, 'migrations')
//       }
//     })
//     await umzug.up()
//     return db.close()
//   } catch (e) {
//     consola.warn(` ⚠️ Cannot connect to db, check your configuration => ${e}`)
//     process.exit(-1)
//   }
// }

async function start (options) {
  try {
    const config = require('./config')
    config.load()
    console.info(`Logging to ${path.resolve(`${config.log_path}/gancio.log`)} [level: ${config.log_level}]`)
  } catch (e) {
    console.error(e)
    process.exit(-1)
  }

  require('./index')
}

// async function setup (options)
console.info(`📅 ${pkg.name} - v${pkg.version} - ${pkg.description} (nodejs: ${process.version})`)

require('yargs')
  .usage('Usage $0 <command> [options]')
  .option('docker', {
    alias: 'd',
    describe: 'Inside docker',
    default: false,
    type: 'boolean'
  })
  .option('db', {
    describe: 'Specify db type'
  })
  .option('config', {
    alias: 'c',
    describe: 'Configuration file',
    default: path.resolve(data_path, 'config.json')
  })
  .coerce('config', config_path => {
    const absolute_config_path = path.resolve(cwd, config_path)
    process.env.config_path = absolute_config_path
    return absolute_config_path
  })
  .command(['start', 'run', '$0'], 'Start gancio', {}, start)
  .help('h')
  .alias('h', 'help')
  .epilog('Made with ❤ by underscore hacklab - https://gancio.org')
  .argv
