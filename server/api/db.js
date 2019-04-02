const Sequelize = require('sequelize')
const conf = require('./config.js')
const db = new Sequelize(conf.db)
// db.sync({force: true})
module.exports = db
