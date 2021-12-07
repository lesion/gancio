const { Model, DataTypes } = require('sequelize')
const sequelize = require('./index').sequelize

class Tag extends Model {}

Tag.init({
  tag: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true,
    primaryKey: true
  }
}, { sequelize, modelName: 'tag' })

module.exports = Tag
