const sequelize = require('./index')
const { Model, DataTypes } = require('sequelize')

class EventNotification extends Model {}

EventNotification.init({
  status: {
    type: DataTypes.ENUM,
    values: ['new', 'sent', 'error'],
    defaultValue: 'new',
    index: true
  }
}, { sequelize, modelName: 'event_notification' })

module.exports = EventNotification
