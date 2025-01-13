'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn('places', 'ap_id', { type: Sequelize.STRING, index: true })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('places', 'ap_id')
  }
};
