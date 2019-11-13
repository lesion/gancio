'use strict'
module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define('comment', {
    activitypub_id: {
      type: DataTypes.STRING,
      index: true,
      unique: true
    },
    hidden: DataTypes.BOOLEAN,
    fedUserApId: {
      type: DataTypes.STRING,
      references: {
        model: 'fed_users',
        key: 'ap_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    data: DataTypes.JSON
  }, {})
  comment.associate = function (models) {
    comment.belongsTo(models.event)
    comment.belongsTo(models.fed_users)
  }
  return comment
}
