
const sequelize = require('./index')
const { Model, DataTypes } = require('sequelize')
const APUser = require('./ap_user')

class Instance extends Model {}

Instance.init({
  domain: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.STRING
  },
  name: DataTypes.STRING,
  blocked: DataTypes.BOOLEAN,
  data: DataTypes.JSON
}, { sequelize, modelName: 'instance' })

Instance.hasMany(APUser)
APUser.belongsTo(Instance)

module.exports = Instance
