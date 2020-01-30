
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('notification', {
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
  }, {
    indexes: [{
      unique: true,
      fields: ['action', 'type']
    }]
  })

  Notification.associate = function (models) {
    Notification.belongsToMany(models.event, { through: 'event_notification' })
  }
  return Notification
}
