// check config.js existance
const fs = require('fs')
const path = require('path')

const config_path = path.join(__dirname, 'config.js')

if (!fs.existsSync(config_path)) {
  console.error(`Configuration file not found at '${config_path}. Please copy 'config.example.js' and modify it.`)
  process.exit(1)
}

const { SECRET_CONF, SHARED_CONF } = require(config_path)
if (!SECRET_CONF.secret) {
  console.error(`Please specify a random 'secret' in '${config_path}'!`)
  process.exit(1);
}

const Sequelize = require('sequelize')
let db
try {
  db = new Sequelize(SECRET_CONF.db)
} catch(e) {
  console.error(`DB Error: check '${SHARED_CONF.env}' configuration.\n (sequelize error -> ${e})`)
  process.exit(1)
}


// return db existence
module.exports = db.authenticate()
.then ( () => {
  require('./api/models')
  if (SHARED_CONF.env === 'development') {
    console.error('DB Force sync')
    return db.sync({force: true})
  }
})
.catch(e => {
  console.error(e)
  console.error(`DB Error: check '${SHARED_CONF.env}' configuration\n (sequelize error -> ${e})`)
  process.exit(1)
})
