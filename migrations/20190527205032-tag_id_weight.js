'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.addColumn('tags', 'weigth', Sequelize.INTEGER)
    await queryInterface.sequelize.query('update "tags" SET weigth=subquery.c from (SELECT COUNT(*) as c, "tagTag" from "tagEvent" group by "tagTag") as subquery  where "subquery"."tagTag"="tags"."tag";')
    await queryInterface.addColumn('places', 'weigth', Sequelize.INTEGER)
    await queryInterface.sequelize.query('update "places" SET weigth=subquery.c from (SELECT COUNT(*) as c, "placeId" from "events" group by "placeId") as subquery  where "subquery"."placeId"="places"."id";')
  },
  
  down: async (queryInterface, Sequelize) => {
    /*
    Add reverting commands here.
    Return a promise to correctly handle asynchronicity.
    
    Example:
    return queryInterface.dropTable('users');
    */
   await queryInterface.removeColumn('tags', 'weigth', Sequelize.INTEGER)   
   await queryInterface.removeColumn('places', 'weigth', Sequelize.INTEGER)   
  }
};
