const { Model, DataTypes } = require('sequelize')
const sequelize = require('./index').sequelize

class Collection extends Model {}

Collection.init({
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
}, { sequelize, modelName: 'collection', timestamps: false })


module.exports = Collection
