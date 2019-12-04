'use strict'
module.exports = (sequelize, DataTypes) => {
  const Instance = sequelize.define('instance', {
    domain: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.STRING
    },
    name: DataTypes.STRING,
    blocked: DataTypes.BOOLEAN,
    data: DataTypes.JSON
  }, {})

  Instance.associate = function (models) {
    Instance.hasMany(models.ap_user)
  }

  return Instance
}
