
const sequelize = require('./index').sequelize
const { Model, DataTypes } = require('sequelize')

const User = require('./user')
const OAuthClient = require('./oauth_client')

class OAuthToken extends Model {}

OAuthToken.init({
  accessToken: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  accessTokenExpiresAt: {
    type: DataTypes.DATE,
    get () {
      return new Date(this.getDataValue('accesTokenExpiresAt'))
    }
  },
  refreshToken: DataTypes.STRING,
  refreshTokenExpiresAt: {
    type: DataTypes.DATE,
    get () {
      return new Date(this.getDataValue('accesTokenExpiresAt'))
    }
  },
  scope: DataTypes.STRING
}, { sequelize, modelName: 'oauth_token' })

OAuthToken.belongsTo(User)
OAuthToken.belongsTo(OAuthClient, { as: 'client' })

module.exports = OAuthToken
