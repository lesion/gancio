module.exports = (sequelize, DataTypes) => 
  sequelize.define('instance', {
  domain: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.STRING
  },
  name: DataTypes.STRING,
  blocked: DataTypes.BOOLEAN,
  data: DataTypes.JSON
})