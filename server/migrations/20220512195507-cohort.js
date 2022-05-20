'use strict';

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.createTable('cohorts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        unique: true,
        index: true,
        allowNull: false
      },
      isActor: {
        type: Sequelize.BOOLEAN
      },
      isTop: {
        type: Sequelize.BOOLEAN
      }
    })
  },

  down (queryInterface, Sequelize) {
    return queryInterface.dropTable('cohorts')
  }
};
