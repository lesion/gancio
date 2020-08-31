module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('tags', 'confirmed', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('tags', 'confirmed')
  }
}
