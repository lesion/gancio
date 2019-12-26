
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('oauth_codes', {
      authorizationCode: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      scope: Sequelize.STRING,
      redirect_uri: Sequelize.STRING,
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      oauthClientClientId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'oauth_clients',
          key: 'client_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },      
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('oauth_codes')
  }
}
