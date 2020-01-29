
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('users', {
      unique: true,
      fields: ['email']
    }).catch(e => {})
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
