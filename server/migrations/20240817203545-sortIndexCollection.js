'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction()
    try {
      await queryInterface.addColumn('collections', 'sortIndex', { type: Sequelize.INTEGER })
      await queryInterface.sequelize.query('UPDATE collections set sortIndex=id')
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
