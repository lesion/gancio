
module.exports = (sequelize, DataTypes) => {
  const OAuthToken = sequelize.define('oauth_token', {
    access_token: DataTypes.STRING,
    refresh_token: DataTypes.STRING,
    scope: DataTypes.STRING,
  }, {})

  OAuthToken.associate = function (models) {
    OAuthToken.belongsTo(models.user)
    OAuthToken.belongsTo(models.oauth_client)
  }

  return OAuthToken
}
