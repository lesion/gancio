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
        await queryInterface.addColumn('ap_users', 'following', { type: Sequelize.BOOLEAN }),
        await queryInterface.addColumn('ap_users', 'friendly', { type: Sequelize.BOOLEAN }),
        await queryInterface.addColumn('filters', 'actors', { type: Sequelize.JSON }),
        await queryInterface.addColumn('events', 'ap_id', { type: Sequelize.STRING }),
        await queryInterface.addColumn('events', 'apUserApId', {
          type: Sequelize.STRING,
          references: {
            model: 'ap_users',
            key: 'ap_id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }),
        // apUserApId
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
        await queryInterface.removeColumn('events', 'apUserApId'),
        await queryInterface.removeColumn('ap_users', 'following'),
        await queryInterface.removeColumn('ap_users', 'friendly'),
      ])
  }
};