
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('announcements', 'announcement', {
      type: Sequelize.TEXT
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('announcements', 'announcement', {
      type: Sequelize.STRING
    })
  }
}
