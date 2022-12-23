module.exports = (sequelize, DataTypes) => 
  sequelize.define('setting', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    index: true
  },
  value: DataTypes.JSON,
  is_secret: DataTypes.BOOLEAN
})
