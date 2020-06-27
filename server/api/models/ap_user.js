const sequelize = require('./index')
const { Model, DataTypes } = require('sequelize')

class APUser extends Model {}

APUser.init({
  ap_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  follower: DataTypes.BOOLEAN,
  blocked: DataTypes.BOOLEAN,
  object: DataTypes.JSON
}, { sequelize, modelName: 'ap_user' })

module.exports = APUser
