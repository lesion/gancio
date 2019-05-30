'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
   const a = queryInterface.changeColumn('events', 'activitypub_id', { type: Sequelize.BIGINT, index: true })
   const b = queryInterface.changeColumn('events', 'activitypub_ids', { type: Sequelize.ARRAY(Sequelize.BIGINT), index: true, defaultValue: [] })
   const c = queryInterface.changeColumn('comments', 'activitypub_id', { type: Sequelize.BIGINT, index: true})
   return Promise.all([a, b, c])
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
