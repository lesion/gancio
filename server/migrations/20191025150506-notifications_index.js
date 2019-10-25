'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addIndex('notifications', {
      unique: true,
      fields: ['action', 'type']
    }).catch(e => {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeIndex('notifications',
      ['actions', 'type'])
  }
};
