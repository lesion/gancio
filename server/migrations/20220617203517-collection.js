'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
     return Promise.all(
      [
        await queryInterface.renameTable('cohorts', 'collections'),
        await queryInterface.renameColumn('filters', 'cohortId', 'collectionId'),
        await queryInterface.changeColumn('filters', 'collectionId', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'collections',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }),
      ])    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
