'use strict'
module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define('comment', {
    activitypub_id: {
      type: DataTypes.STRING(18),
      index: true,
      unique: true,
    },
    data: DataTypes.JSON
  }, {})
  comment.associate = function (models) {
    comment.belongsTo(models.event)
    // Event.hasMany(Comment)
    // associations can be defined here
  }
  return comment
};
