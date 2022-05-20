const { Model, DataTypes } = require('sequelize')
const sequelize = require('./index').sequelize

class Filter extends Model {}

Filter.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cohortId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'cohorts',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  tags: {
    type: DataTypes.JSON,
  },
  places: {
    type: DataTypes.JSON,
  }
}, { sequelize, modelName: 'filter', timestamps: false })


module.exports = Filter
