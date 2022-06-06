const { Model, DataTypes } = require('sequelize')
const Cohort = require('./cohort')
const sequelize = require('./index').sequelize

class Filter extends Model {}

Filter.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tags: {
    type: DataTypes.JSON,
  },
  places: {
    type: DataTypes.JSON,
  }
}, { sequelize, modelName: 'filter', timestamps: false })

Filter.belongsTo(Cohort)
Cohort.hasMany(Filter)

module.exports = Filter
