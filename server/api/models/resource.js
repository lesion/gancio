const { Model, DataTypes } = require('sequelize')
const sequelize = require('./index').sequelize

const APUser = require('./ap_user')

class Resource extends Model {}

Resource.init({
  activitypub_id: {
    type: DataTypes.STRING,
    index: true,
    unique: true
  },
  hidden: DataTypes.BOOLEAN,
  data: DataTypes.JSON
}, { sequelize, modelName: 'resource' })

APUser.hasMany(Resource)
Resource.belongsTo(APUser)

module.exports = Resource
