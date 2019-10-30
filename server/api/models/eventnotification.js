'use strict'
module.exports = (sequelize, DataTypes) => {
  const event_notification = sequelize.define('event_notification', {
    status: {
      type: DataTypes.ENUM,
      values: ['new', 'sent', 'error'],
      defaultValue: 'new',
      index: true
    }
  }, {})

  return event_notification
}
