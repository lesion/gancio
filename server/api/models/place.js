'use strict'
module.exports = (sequelize, DataTypes) => {
  const place = sequelize.define('place', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      index: true,
      allowNull: false
    },
    address: DataTypes.STRING
  }, {})

  place.associate = function (models) {
    place.hasMany(models.event)
  }

  return place
}
