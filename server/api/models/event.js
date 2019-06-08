'use strict'
module.exports = (sequelize, DataTypes) => {
  const event = sequelize.define('event', {
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.TEXT,
    multidate: DataTypes.BOOLEAN,
    start_datetime: {
      type: DataTypes.DATE,
      index: true
    },
    end_datetime: DataTypes.DATE,
    image_path: DataTypes.STRING,
    is_visible: DataTypes.BOOLEAN,
    activitypub_id: {
      type: DataTypes.BIGINT,
      index: true
    }
  }, {})
  event.associate = function (models) {
    event.belongsTo(models.place)
    event.belongsTo(models.user)
    event.belongsToMany(models.tag, { through: 'event_tags' })
    event.belongsToMany(models.notification, { through: 'event_notification' })
    event.hasMany(models.comment)
    // Tag.belongsToMany(Event, { through: 'tagEvent' })
    // Event.hasMany(models.Tag)
    // associations can be defined here
  }
  return event
}
