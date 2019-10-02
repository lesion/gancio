'use strict'
module.exports = (sequelize, DataTypes) => {
  const event_notification = sequelize.define('event_notification', {
    status: {
      type: DataTypes.ENUM,
      values: ['new', 'sent', 'error'],
      defaultValue: 'new',
      errorMessage: DataTypes.TEXT,
      index: true
    }
  }, {})

 return event_notification
}
