'use strict';

/** @type {import('sequelize-cli').Migration} */
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
        await queryInterface.addColumn('ap_users', 'trusted', { type: Sequelize.BOOLEAN }),
        await queryInterface.addColumn('instances', 'applicationActor', { type: Sequelize.STRING }),
        await queryInterface.addColumn('ap_users', 'following', { type: Sequelize.BOOLEAN }),
        await queryInterface.addColumn('filters', 'actors', { type: Sequelize.JSON }),
        await queryInterface.addColumn('events', 'ap_id', { type: Sequelize.STRING, index: true }),
        await queryInterface.addColumn('events', 'apUserApId', {
          type: Sequelize.STRING,
          references: {
            model: 'ap_users',
            key: 'ap_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }),
      ])
  },

  async down (queryInterface, Sequelize) {
    return Promise.all(
      [
        await queryInterface.removeColumn('instances', 'applicationActor'),
        await queryInterface.removeColumn('events', 'apUserApId'),
        await queryInterface.removeColumn('events', 'ap_id'),
        await queryInterface.removeColumn('ap_users', 'following'),
        await queryInterface.removeColumn('ap_users', 'trusted'),
      ])
  }
};