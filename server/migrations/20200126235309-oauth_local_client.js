'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('oauth_clients', [{
      id: 'self',
      name: 'self',
      scopes: 'all',
      createdAt: new Date(),
      updatedAt: new Date()
    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('oauth_clients', { id: 'self' })
  }
}
