'use strict';
const { notification: Notification } = require('../api/models')

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // remove all notifications
    await Notification.destroy({where: []})

    // add `action` field to notification
    try {
      await queryInterface.addColumn('notifications', 'action', {
        type: Sequelize.ENUM,
        values: ['Create', 'Update', 'Delete']
      })
    } catch {}

    // modify values of `type` field
    try {
      await queryInterface.removeColumn('notifications', 'type')
    } catch {}

    try {
      await queryInterface.addColumn('notifications', 'type', {
        type: Sequelize.ENUM,
        values: ['mail', 'admin_email', 'ap']
      })
    } catch {}

    await queryInterface.addIndex('notifications', {
      unique: true,
      fields: ['action', 'type' ]
    })

    // add AP notifications
    await Notification.create({ action: 'Create', type: 'ap', filters: { is_visible: true } })
    await Notification.create({ action: 'Update', type: 'ap', filters: { is_visible: true } })
    await Notification.create({ action: 'Delete', type: 'ap', filters: { is_visible: true } })

    // send anon events via email to admin
    await Notification.create({ action: 'Create', type: 'admin_email', filters: { is_visible: false } })

    return true
  },

  down: (queryInterface, Sequelize) => {
    return Promise.resolve()
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
