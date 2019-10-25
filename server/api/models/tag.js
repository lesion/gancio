'use strict'
module.exports = (sequelize, DataTypes) => {
  const tag = sequelize.define('tag', {
    tag: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true,
      primaryKey: true
    },
    weigth: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
  }, {})

  tag.associate = function (models) {
    tag.belongsToMany(models.event, { through: 'event_tags' })
  }

  return tag
}
