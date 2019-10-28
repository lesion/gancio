'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('settings',
      {
        key: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
          index: true
        },
        value: Sequelize.JSON,
        is_secret: Sequelize.BOOLEAN,
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
    return queryInterface.dropTable('settings')
  }
}
