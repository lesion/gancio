'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn('events', 'ap_object', { type: Sequelize.JSON })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('events', 'ap_object')
  }
};
