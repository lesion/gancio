module.exports = (sequelize, DataTypes) => 
sequelize.define('oauth_client', {
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
})