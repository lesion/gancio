
module.exports = (sequelize, DataTypes) => {
  const OAuthClient = sequelize.define('oauth_client', {
    client_id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: DataTypes.STRING,
    scopes: DataTypes.STRING,
    client_secret: DataTypes.STRING,
    redirectUris: DataTypes.STRING
  }, {})

  OAuthClient.associate = function (models) {
    OAuthClient.belongsTo(models.user)
  }

  return OAuthClient
}
