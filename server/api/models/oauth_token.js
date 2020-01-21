
module.exports = (sequelize, DataTypes) => {
  const OAuthToken = sequelize.define('oauth_token', {
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
  }, {})

  OAuthToken.associate = function (models) {
    OAuthToken.belongsTo(models.user)
    OAuthToken.belongsTo(models.oauth_client, { as: 'client' })
  }

  return OAuthToken
}
