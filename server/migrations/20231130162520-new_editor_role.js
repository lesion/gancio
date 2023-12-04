const  User = require('../api/models/user')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM,
      values: ['admin', 'editor', 'user'],
      defaultValue: 'user'
    })

    const user = User(queryInterface.sequelize, Sequelize.DataTypes)
    await user.update({ role: 'admin'}, { where: { is_admin: true } })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'role')
    // await queryInterface.removeColumn('users', 'is_editor')
  }
}
