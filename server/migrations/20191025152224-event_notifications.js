'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('event_notifications', {
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      eventId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'events',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      notificationId: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'notifications',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('event_notifications')
  }
}
