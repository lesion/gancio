'use strict';


module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.createTable('filters', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      cohortId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'cohorts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tags: {
        type: Sequelize.JSON,
      },
      places: {
        type: Sequelize.JSON,
      }
    })
  },

  down (queryInterface, _Sequelize) {
    return queryInterface.dropTable('filters')
  }

}