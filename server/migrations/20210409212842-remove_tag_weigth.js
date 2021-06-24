
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('tags', 'weigth')
  }
}
