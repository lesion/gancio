'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      filters: {
        type: Sequelize.JSON
      },
      email: {
        type: Sequelize.STRING
      },
      remove_code: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM,
        values: ['mail', 'admin_email', 'mastodon']        
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('notifications');
  }
};