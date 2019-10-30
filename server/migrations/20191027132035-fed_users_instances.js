'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('fed_users', 'instanceDomain', {
      type: Sequelize.STRING,
      references: {
        model: 'instances',
        key: 'domain'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('fed_users', 'instanceDomain')
  }
}
