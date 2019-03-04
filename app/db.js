const Sequelize = require('sequelize')
const conf = require('./config.js')
console.error(conf.db)
const db = new Sequelize(conf.db)

db.sync({ force: true })
// db.sync()

module.exports = db
