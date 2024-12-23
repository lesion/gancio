module.exports = (sequelize, DataTypes) => 
  sequelize.define('place', {
  name: {
    type: DataTypes.STRING,
    unique: true,
    index: true,
    allowNull: false
  },
  address: DataTypes.STRING,
  latitude: DataTypes.FLOAT,
  longitude: DataTypes.FLOAT,
})