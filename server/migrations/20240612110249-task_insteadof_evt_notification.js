'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.dropTable('event_notifications')
    await queryInterface.createTable('tasks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['new', 'sent', 'error', 'sending'],
        defaultValue: 'new',
        index: true
      },
      error: {
        type: Sequelize.TEXT
      },
      eventId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      notificationId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'notifications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }      
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('tasks')
  }
};
