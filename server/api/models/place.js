module.exports = (sequelize, DataTypes) => 
  sequelize.define('place', {
  name: {
    type: DataTypes.STRING,
    unique: true,
    index: true,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    index: true,
    unique: true
  },
  address: DataTypes.STRING,
  latitude: DataTypes.FLOAT,
  longitude: DataTypes.FLOAT,
})