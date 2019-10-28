'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('fed_users', 'instanceId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'instances',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropColumn('fed_users', 'instanceId')
  }
}
