'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // needed as in sequelize there is no support for alter table and sequelize simulate this by creating a backup table and dropping the old one:
    // this will cause a foreign key error
    const dialect = queryInterface.sequelize.getDialect()
    if (dialect === 'sqlite') {
      await queryInterface.sequelize.query('PRAGMA foreign_keys = OFF')
    }

    await queryInterface.changeColumn('places', 'name', { type: Sequelize.STRING, index: true, allowNull: false, unique: false })
  },

  async down (queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect()
    if (dialect === 'sqlite') {
      await queryInterface.sequelize.query('PRAGMA foreign_keys = OFF')
    }
    await queryInterface.changeColumn('places', 'name', { type: Sequelize.STRING, index: true, allowNull: false, unique: true })
  }
};
