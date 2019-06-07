const argv = require('yargs').argv
const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const config_path = path.resolve(argv.config || './config.js')
const basename = path.basename(__filename)
const config = require(config_path).SECRET_CONF.db
const db = {}

const sequelize = new Sequelize(config)

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
