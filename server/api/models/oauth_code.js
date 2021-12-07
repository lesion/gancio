
const sequelize = require('./index').sequelize
const { Model, DataTypes } = require('sequelize')

const User = require('./user')
const OAuthClient = require('./oauth_client')

class OAuthCode extends Model {}

OAuthCode.init({
  authorizationCode: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  expiresAt: DataTypes.DATE,
  scope: DataTypes.STRING,
  redirect_uri: DataTypes.STRING
}, { sequelize, modelName: 'oauth_code' })

OAuthCode.belongsTo(User)
OAuthCode.belongsTo(OAuthClient, { as: 'client' })

module.exports = OAuthCode
