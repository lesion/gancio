module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'recover_code',
      { type: Sequelize.STRING })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'recover_code')
  }
}
