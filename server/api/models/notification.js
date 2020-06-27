
const sequelize = require('./index')
const { Model, DataTypes } = require('sequelize')
// const Event = require('./event')

class Notification extends Model {}

Notification.init({
  filters: DataTypes.JSON,
  email: DataTypes.STRING,
  remove_code: DataTypes.STRING,
  action: {
    type: DataTypes.ENUM,
    values: ['Create', 'Update', 'Delete']
  },
  type: {
    type: DataTypes.ENUM,
    values: ['mail', 'admin_email', 'ap']
  }
},
{
  sequelize,
  modelName: 'notification',
  indexes: [{
    unique: true,
    fields: ['action', 'type']
  }]
})

// Notification.belongsToMany(Event, { through: 'event_notification' })

module.exports = Notification
