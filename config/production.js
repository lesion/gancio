const argv = require('yargs').argv
const path = require('path')
const fs = require('fs')

const config_path = path.resolve(argv.config || '/etc/gancio_config.json')

let config = {}
if (fs.existsSync(config_path)) {
  config = require(config_path)
}

module.exports = config
