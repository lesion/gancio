const { Model, DataTypes } = require('sequelize')
const sequelize = require('./index').sequelize

class Setting extends Model {}

Setting.init({
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    index: true
  },
  siteId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: true,
    index: true
  },
  value: DataTypes.JSON,
  is_secret: DataTypes.BOOLEAN
}, { sequelize, modelName: 'setting' })

module.exports = Setting
