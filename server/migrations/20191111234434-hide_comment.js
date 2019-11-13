module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('comments', 'hidden', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('comments', 'hidden')
  }
}
