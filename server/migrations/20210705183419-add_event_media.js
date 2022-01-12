
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        await queryInterface.addColumn('events', 'media', { type: Sequelize.JSON }),
        await queryInterface.sequelize.query("UPDATE events set media=JSON('[{ \"url\": \"' || image_path || '\" }]')")
      ])
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.removeColumn('events', 'media')
  }
}
