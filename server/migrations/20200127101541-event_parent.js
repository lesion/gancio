
module.exports = {
  up: (queryInterface, Sequelize) => {
    // return Promise.resolve(1)
    return queryInterface.addColumn('events', 'parentId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'events',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('events', 'parentId')
  }
}
