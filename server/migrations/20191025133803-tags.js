'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tags',
      {
        tag: {
          type: Sequelize.STRING,
          allowNull: false,
          index: true,
          primaryKey: true
        },
        weigth: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
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
    return queryInterface.dropTable('tags')
  }
}
