'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'ap_object', { type: Sequelize.JSON })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'ap_object')
  }
};
