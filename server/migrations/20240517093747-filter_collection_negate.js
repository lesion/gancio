'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn('filters', 'negate', { type: Sequelize.BOOLEAN })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('filters', 'negate')
  }
}
