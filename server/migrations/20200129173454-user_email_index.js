
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('users', {
      unique: true,
      fields: ['email']
    }).catch(e => {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('users', ['email'])
  }
}
