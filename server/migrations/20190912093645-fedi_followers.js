'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('users', 'followers'),
      queryInterface.createTable('user_followers', {
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          },
          primaryKey: true,
          allowNull: false
        },
        fedUserApId: {
          primaryKey: true,
          type: Sequelize.STRING,
          references: {
            model: 'fed_users',
            key: 'ap_id'
          }
        },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }        
      })
  ])},

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
      'users', 'followers', {
        type: JSON,
        defaultValue: []
      }),
      queryInterface.dropTable('user_followers')
    ])
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
