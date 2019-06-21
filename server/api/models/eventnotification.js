'use strict'
module.exports = (sequelize, DataTypes) => {
  const eventNotification = sequelize.define('eventNotification', {
    status: {
      type: DataTypes.ENUM,
      values: ['new', 'sent', 'error'],
      defaultValue: 'new',
      errorMessage: DataTypes.TEXT,
      index: true
    }
  }, {})

  return eventNotification
}
