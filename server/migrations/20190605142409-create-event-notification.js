module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('event_notification', {
      eventId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'events',
          key: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      notificationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'notifications',
          key: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      status: {
        type: Sequelize.ENUM,
        values: ['new', 'sent', 'error'],
        defaultValue: 'new',
        index: true
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
    return queryInterface.dropTable('event_notification')
  }
}
