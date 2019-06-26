const path = require('path')
const fs = require('fs')

const config_path = process.env.config_path

let config = {}
if (fs.existsSync(config_path)) {
  config = require(config_path)
}

module.exports = config
