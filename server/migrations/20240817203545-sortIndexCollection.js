'use strict';
const Collection = require('../api/models/collection')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn('collections', 'sortIndex', { type: Sequelize.INTEGER })
      const collection = Collection(queryInterface.sequelize, Sequelize.DataTypes)
      await collection.update({ sortIndex: Sequelize.col('id')}, { where: {}, transaction })
      return transaction.commit()
    } catch (e) {
       if (transaction) {
        await transaction.rollback()
      }
      return Promise.reject(e)
    }
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('collections', 'sortIndex')
  }
}
