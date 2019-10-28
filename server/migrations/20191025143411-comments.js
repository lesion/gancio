'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('comments',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        activitypub_id: {
          type: Sequelize.STRING(18),
          index: true,
          unique: true
        },
        eventId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'events',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        data: Sequelize.JSON,
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
    return queryInterface.dropTable('comments')
  }
}
