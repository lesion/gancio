'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('fed_users', 'blocked', { type: Sequelize.BOOLEAN })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('fed_users', 'blocked', { type: Sequelize.BOOLEAN })
  }
}
