const config = require('config')
const Helpers = require('./helpers')
const { user: User } = require('../api/models')
const crypto = require('crypto')

module.exports = {
  // follow request from fediverse
  async follow (req, res, body, targetOrigin, domain) {
    if (typeof body.object !== 'string') return
    const username = body.object.replace(`${config.baseurl}/federation/u/`, '')
    const user = await User.findOne({ where: { username }})
    if (!user) {
      res.sendStatus(404)
      return
    }
    // check for duplicate
    if (user.followers.indexOf(body.actor) === -1) {
      console.error('ok this is a new follower: ', body.actor)
      await user.update({ followers: [...user.followers, body.actor] })
    }
    const guid = crypto.randomBytes(16).toString('hex')
    let message = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'id': `${config.baseurl}/federation/${guid}`,
      'type': 'Accept',
      'actor': `${config.baseurl}/federation/u/${user.username}`,
      'object': body,
    }    
    Helpers.signAndSend(message, user, body.actor)
    res.sendStatus(200)
  },
  // unfollow request from fediverse
  unfollow () {
    console.error('inside unfollow')
  }
}
