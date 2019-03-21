const Sequelize = require('sequelize')
const conf = require('./config.js')
const db = new Sequelize(conf.db)
module.exports = db
