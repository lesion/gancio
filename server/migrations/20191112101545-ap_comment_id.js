'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('comments', 'activitypub_id', {
      type: Sequelize.STRING,
      index: true,
      unique: true
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('comments', 'activitypub_id', {
      type: Sequelize.STRING(18),
      index: true,
      unique: true
    })
  }
}
