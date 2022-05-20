const { Model, DataTypes } = require('sequelize')
const sequelize = require('./index').sequelize

class Cohort extends Model {}

Cohort.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    index: true,
    allowNull: false
  },
  isActor: {
    type: DataTypes.BOOLEAN
  },
  isTop: {
    type: DataTypes.BOOLEAN
  }
}, { sequelize, modelName: 'cohort', timestamps: false })


module.exports = Cohort
