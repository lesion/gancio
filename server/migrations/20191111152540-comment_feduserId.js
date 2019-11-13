module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('comments', 'fedUserApId', {
      type: Sequelize.STRING,
      references: {
        model: 'fed_users',
        key: 'ap_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('comments', 'fedUserApId')
  }
}
