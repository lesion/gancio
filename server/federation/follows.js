const config = require('config')
const Helpers = require('./helpers')
const { user: User } = require('../api/models')

module.exports = {
  // follow request from fediverse
  async follow (req, res, body, targetOrigin, domain) {
    if (typeof b.object !== 'string') return
    const username = body.object.replace(`${config.baseurl}/federation/u/`, '')
    console.error('someone wants to follow ' + username)
    const user = await User.findOne({ where: { username }})
    if (!user) {
      console.error('No user found!')
      return
    }
    Helpers.sendAcceptMessage(body, user, domain, req, res, targetOrigin)
    console.error('FOLLOWERS ', user.followers)
    if (user.followers.indexOf(body.actor) === -1) {
      console.error('ok this is a new follower: ', body.actor)
      await user.update({ followers: [...user.followers, body.actor] })
    }

  },
  // unfollow request from fediverse
  unfollow () {
    console.error('inside unfollow')
  }
}