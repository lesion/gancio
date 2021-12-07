const sequelize = require('./index').sequelize
const { Model, DataTypes } = require('sequelize')

class Announcement extends Model {}

Announcement.init({
  title: DataTypes.STRING,
  announcement: DataTypes.STRING,
  visible: DataTypes.BOOLEAN
}, { sequelize, modelName: 'announcement' })

module.exports = Announcement
