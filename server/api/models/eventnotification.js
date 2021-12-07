const sequelize = require('./index').sequelize
const { Model, DataTypes } = require('sequelize')

class EventNotification extends Model {}

EventNotification.init({
  status: {
    type: DataTypes.ENUM,
    values: ['new', 'sent', 'error', 'sending'],
    defaultValue: 'new',
    index: true
  }
}, { sequelize, modelName: 'event_notification' })

module.exports = EventNotification
