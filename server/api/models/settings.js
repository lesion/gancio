const db = require('../db')
const Sequelize = require('sequelize')

const Settings = db.define('settings', {
  key: { type: Sequelize.STRING, primaryKey: true, index: true },
  value: Sequelize.JSON
})

module.exports = Settings
