
const sequelize = require('./index').sequelize
const { Model, DataTypes } = require('sequelize')

class OAuthClient extends Model {}

OAuthClient.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: DataTypes.STRING,
  client_secret: DataTypes.STRING,
  scopes: DataTypes.STRING,
  redirectUris: DataTypes.STRING,
  website: DataTypes.STRING
}, { sequelize, modelName: 'oauth_client' })

module.exports = OAuthClient
