const argv = require('yargs').argv
const path = require('path')
const config_path = path.resolve(argv.config || './config.js')

module.exports = require(config_path)
