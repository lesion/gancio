module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('events', 'slug', {
      type: Sequelize.STRING,
      index: true,
      unique: true
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
