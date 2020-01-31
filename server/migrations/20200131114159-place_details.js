
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('places', 'details', { type: Sequelize.JSON })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('places', 'details')
  }
}
