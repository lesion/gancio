// check config.js existance
const fs = require('fs')
const path = require('path')
const argv = require('yargs').argv

const config_path = path.resolve(argv.config || './config.js')

if (!fs.existsSync(config_path)) {
  console.error(`Configuration file not found at '${config_path}. Please copy 'config.example.js' and modify it.`)
  process.exit(1)
}

const config = require(config_path)
if (!config.secret) {
  console.error(`Please specify a random 'secret' in '${config_path}'!`)
  process.exit(1)
}

const Sequelize = require('sequelize')
let db
try {
  db = new Sequelize(config.db)
} catch (e) {
  console.error(`DB Error: check '${config.env}' configuration.\n (sequelize error -> ${e})`)
  process.exit(1)
}

// return db existence
module.exports = db.authenticate()
  .then(() => {
    require('./api/models')
    if (config.env === 'development') {
      console.error('DB Force sync')
      return db.sync({ force: true })
    }
  })
  .catch(e => {
    console.error(e)
    console.error(`DB Error: check '${config.env}' configuration\n (sequelize error -> ${e})`)
    process.exit(1)
  })
