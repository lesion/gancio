const SequelizeSlugify = require('sequelize-slugify')
let Place = require('../api/models/place')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn('places', 'slug', { type: Sequelize.STRING })
      const place = Place(queryInterface.sequelize, Sequelize.DataTypes)
      await SequelizeSlugify.slugifyModel(place, { source: ['name'], overwrite: false })
      const places = await place.findAll({transaction })
      for(const place of places) {
        await place.regenerateSlug(transaction)
        await place.save()
      }
      await queryInterface.changeColumn('places', 'slug', {
        type: Sequelize.STRING,
        index: true,
        unique: true
      })
      await transaction.commit()
    } catch (e) {
      console.error(e)
       if (transaction) {
        await transaction.rollback()
       }
      return Promise.reject(e)
    }
  },

  down: (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
