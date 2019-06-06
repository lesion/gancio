'use strict';
module.exports = (sequelize, DataTypes) => {
  const tag = sequelize.define('tag', {
    tag: {
      type: DataTypes.STRING,
      index: true,
      primaryKey: true
    },
    weigth: DataTypes.INTEGER,
    color: DataTypes.STRING
  }, {});

  tag.associate = function(models) {
    tag.belongsToMany(models.event, { through: 'event_tags' })
    // associations can be defined here
  };

  return tag;
};