const Sequelize = require('sequelize')
const { SECRET_CONF } = require('../../config.js')

const db = new Sequelize(SECRET_CONF.db)
// db.sync()
module.exports = db
