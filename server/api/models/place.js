const { Model, DataTypes } = require('sequelize')
const sequelize = require('./index')

// const Event = require('./event')
class Place extends Model {}

Place.init({
  name: {
    type: DataTypes.STRING,
    unique: true,
    index: true,
    allowNull: false
  },
  address: DataTypes.STRING
}, { sequelize, modelName: 'place' })

// Place.hasMany(Event)

module.exports = Place
