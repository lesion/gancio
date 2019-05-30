'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
   const a = queryInterface.addColumn('events', 'activitypub_ids', Sequelize.ARRAY(Sequelize.DOUBLE), { index: true })
   const b = queryInterface.addColumn('comments', 'data', Sequelize.JSON)
   return Promise.all([a, b])
   
  },
  
  down: (queryInterface, Sequelize) => {
    /*
    Add reverting commands here.
    Return a promise to correctly handle asynchronicity.
    
    Example:
    return queryInterface.dropTable('users');
    */
    const b = queryInterface.removeColumn('comments', 'data')
    const a = queryInterface.removeColumn('events', 'activitypub_ids')
    return Promise.all([a, b])
  }
};
