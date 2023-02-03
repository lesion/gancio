module.exports = (sequelize, DataTypes) => 
  sequelize.define('oauth_token', {
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
})