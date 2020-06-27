const { Model, DataTypes } = require('sequelize')
// const Event = require('./event')
const sequelize = require('./index')

class Tag extends Model {}

Tag.init({
  tag: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true,
    primaryKey: true
  },
  weigth: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false }
}, { sequelize, modelName: 'tag' })

// Tag.belongsToMany(Event, { through: 'event_tags' })

module.exports = Tag
