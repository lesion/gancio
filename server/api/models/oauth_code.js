module.exports = (sequelize, DataTypes) => 
  sequelize.define('oauth_code', {
  authorizationCode: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  expiresAt: DataTypes.DATE,
  scope: DataTypes.STRING,
  redirect_uri: DataTypes.STRING
})