'use strict'
module.exports = (sequelize, DataTypes) => {
  const place = sequelize.define('place', {
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    weigth: DataTypes.INTEGER
  }, {})

  place.associate = function (models) {
    // associations can be defined here
    place.hasMany(models.event)
  }

  return place
}
