module.exports = (sequelize, DataTypes) => 
  sequelize.define('event_notification', {
  status: {
    type: DataTypes.ENUM,
    values: ['new', 'sent', 'error', 'sending'],
    defaultValue: 'new',
    index: true
  }
})