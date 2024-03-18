'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('messages',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false
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
        author: {
          type: Sequelize.ENUM,
          values: ['AUTHOR', 'ADMIN', 'ANON', 'REGISTERED']
        },
        is_author_visible: Sequelize.BOOLEAN,
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

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('messages')
  }
};
