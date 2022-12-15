'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     return Promise.all(
      [
        await queryInterface.addColumn('places', 'latitude', { type: Sequelize.FLOAT }),
        await queryInterface.addColumn('places', 'longitude', { type: Sequelize.FLOAT })
      ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     return Promise.all(
      [
        await queryInterface.removeColumn('places', 'latitude'),
        await queryInterface.removeColumn('places', 'longitude')
      ])
  }
};
