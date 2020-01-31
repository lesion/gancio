
module.exports = (sequelize, DataTypes) => {

  const Place = sequelize.define('place', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      index: true,
      allowNull: false
    },
    address: DataTypes.STRING,
    details: DataTypes.JSON
  }, {})

  Place.associate = function (models) {
    Place.hasMany(models.event)
  }

  return Place
}
