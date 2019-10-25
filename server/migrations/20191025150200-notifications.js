'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('notifications',{
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      filters: Sequelize.JSON,
      email: Sequelize.STRING,
      remove_code: Sequelize.STRING,
      action: {
        type: Sequelize.ENUM,
        values: ['Create', 'Update', 'Delete']
      },
      type: {
        type: Sequelize.ENUM,
        values: ['mail', 'admin_email', 'ap']
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('notifications')
  }
};
