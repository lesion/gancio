const { Model, DataTypes } = require('sequelize')
const sequelize = require('./index').sequelize

class Place extends Model {}

Place.init({
  name: {
    type: DataTypes.STRING,
    unique: true,
    index: true,
    allowNull: false
  },
  address: DataTypes.STRING,
  latitude: DataTypes.FLOAT,
  longitude: DataTypes.FLOAT,
}, { sequelize, modelName: 'place' })

module.exports = Place
