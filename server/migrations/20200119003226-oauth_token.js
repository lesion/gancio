module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('oauth_tokens', {
      accessToken: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      accessTokenExpiresAt: Sequelize.DATE,
      refreshToken: Sequelize.STRING,
      refreshTokenExpiresAt: Sequelize.DATE,
      scope: Sequelize.STRING,
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      clientId: {
        type: Sequelize.STRING,
        references: {
          model: 'oauth_clients',
          key: 'id'
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
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      */
    return queryInterface.dropTable('oauth_tokens')
  }
}
