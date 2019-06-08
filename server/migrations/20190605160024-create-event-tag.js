'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('event_tags', {
      eventId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'events',
          key: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      tagTag: {
        type: Sequelize.STRING,
        references: {
          model: 'tags',
          key: 'tag'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('event_tags')
  }
}
