'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addIndex('ap_users', ['trusted'])
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeIndex('ap_users', ['trusted'])
  }
};
