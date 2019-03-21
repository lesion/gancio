module.exports = {
  up: (queryInterface, Sequelize) => {
    // return queryInterface.addColumn('EventNotifications', 'status',
    //   { type: Sequelize.ENUM, values: ['new', 'sent', 'error'], index: true, defaultValue: 'new' })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('EventNotifications', 'status')
  }
}
