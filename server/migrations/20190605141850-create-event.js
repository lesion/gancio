'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      slug: {
        type: Sequelize.STRING,
        index: true,
      },
      description: {
        type: Sequelize.TEXT
      },
      multidate: {
        type: Sequelize.BOOLEAN
      },
      start_datetime: {
        type: Sequelize.DATE
      },
      end_datetime: {
        type: Sequelize.DATE
      },
      image_path: {
        type: Sequelize.STRING
      },
      is_visible: {
        type: Sequelize.BOOLEAN
      },
      activitypub_id: {
        type: Sequelize.BIGINT
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      placeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'places',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('events');
  }
};