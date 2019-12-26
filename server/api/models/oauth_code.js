
module.exports = (sequelize, DataTypes) => {
  const OAuthCode = sequelize.define('oauth_code', {
    authorizationCode: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    scope: DataTypes.STRING,
    redirect_uri: DataTypes.STRING
  }, {})

  OAuthCode.associate = function (models) {
    OAuthCode.belongsTo(models.user)
    OAuthCode.belongsTo(models.oauth_client)
  }

  return OAuthCode
}
