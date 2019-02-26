const Sequelize = require('sequelize')
const env = process.env.NODE_ENV || 'development'
const conf = require('../config/config.' + env + '.json')
const db = new Sequelize(conf.db)

// db.sync({ force: true })
// db.sync()

module.exports = db
