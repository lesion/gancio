module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('fed_users', 'follower', {
      type: Sequelize.BOOLEAN
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('fed_users', 'follower')
  }
}
