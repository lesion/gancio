
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('places', 'confirmed')
  }
}
