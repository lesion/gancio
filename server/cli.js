#!/usr/bin/env node
const pkg = require('../package.json')
const path = require('path')

process.env.cwd = path.resolve('./')

// needed by nuxt
if (process.env.NODE_ENV === 'production') {
  process.chdir(path.resolve(__dirname, '..'))
}

async function start (options) {
  try {
    require('./config')
  } catch (e) {
    console.error(e)
    process.exit(-1)
  }

  require('./index')
}

console.info(`📅 ${pkg.name} - v${pkg.version} - ${pkg.description} (nodejs: ${process.version}, ENV: ${process.env.NODE_ENV})`)

require('yargs')
  .usage('Usage $0 <command> [options]')
  .option('docker', {
    alias: 'd',
    describe: 'Inside docker',
    default: false,
    type: 'boolean'
  })
  .option('config', {
    alias: 'c',
    describe: 'Configuration file',
    default: path.resolve(process.env.cwd, 'config.json')
  })
  .coerce('config', config_path => {
    const absolute_config_path = path.resolve(process.env.cwd, config_path)
    process.env.config_path = absolute_config_path
    return absolute_config_path
  })
  .command(['start', 'run', '$0'], 'Start gancio', {}, start)
  .help('h')
  .alias('h', 'help')
  .epilog('Made with ❤ by underscore hacklab - https://gancio.org')
  .argv
