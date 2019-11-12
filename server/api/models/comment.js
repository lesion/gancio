'use strict'
module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define('comment', {
    activitypub_id: {
      type: DataTypes.STRING,
      index: true,
      unique: true
    },
    data: DataTypes.JSON
  }, {})
  comment.associate = function (models) {
    comment.belongsTo(models.event)
  }
  return comment
}
