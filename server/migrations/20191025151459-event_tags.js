'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('event_tags', {
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      eventId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'events',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tagTag: {
        primaryKey: true,
        type: Sequelize.STRING,
        references: {
          model: 'tags',
          key: 'tag',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('event_tags')
  }
};
