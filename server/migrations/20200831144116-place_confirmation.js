module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('places', 'confirmed', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('places', 'confirmed')
  }
}
