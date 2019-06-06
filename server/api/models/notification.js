'use strict';
module.exports = (sequelize, DataTypes) => {
  const notification = sequelize.define('notification', {
    filters: DataTypes.JSON,
    email: DataTypes.STRING,
    remove_code: DataTypes.STRING,
    type: {
      type: DataTypes.ENUM,
      values: ['mail', 'admin_email', 'mastodon']
    }
  }, {});
  notification.associate = function(models) {
    notification.belongsToMany(models.event, { through: 'event_notification' })    
    // associations can be defined here
  };
  return notification;
};