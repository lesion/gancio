'use strict'
module.exports = (sequelize, DataTypes) => {
  const eventNotification = sequelize.define('eventNotification', {
    status: {
      type: DataTypes.ENUM,
      values: ['new', 'sent', 'error'],
      defaultValue: 'new',
      index: true
    }
  }, {})

  eventNotification.associate = function (models) {
    // associations can be defined here
  }
  return eventNotification
}
