module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('fed_users', 'follower', {
      type: Sequelize.BOOLEAN
    })

    // const users = queryInterface.sequelize.query('SELECT ')
    // const followers = users.reduce((followers, user) => followers.concat(user.followers), [])
    // console.error(followers)
    // const followers = await Sequelize.models.user_followers.findAll()
    // console.error(followers)
    // get current followers
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('fed_users', 'follower')
  }
}
