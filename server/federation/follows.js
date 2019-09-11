const config = require('config')
const Helpers = require('./helpers')
const { user: User } = require('../api/models')
const crypto = require('crypto')
const debug = require('debug')('follows')

module.exports = {
  // follow request from fediverse
  async follow (req, res) {
    const body = req.body
    if (typeof body.object !== 'string') return
    const username = body.object.replace(`${config.baseurl}/federation/u/`, '')
    const user = await User.findOne({ where: { username }})
    if (!user) return res.status(404).send('User not found')

    // check for duplicate
    if (user.followers.indexOf(body.actor) === -1) {
      debug('%s followed by %s (%d)', username, body.actor, user.followers.length)
      await user.update({ followers: [...user.followers, body.actor] })
    } else {
      debug('duplicate %s followed by %s', username, body.actor)
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
  async unfollow (req, res) {
    debug("Unfollow UNFOLLOW!")
    const body = req.body
    const username = body.object.object.replace(`${config.baseurl}/federation/u/`, '')
    const user = await User.findOne({ where: { username }})
    if (!user) return res.status(404).send('User not found')

    if (body.actor !== body.object.actor) return res.status(400).send('Bad things')
    user.followers = user.followers.filter(follower => follower !== username)
    debug('%s unfollowed by %s (%d)', username, body.actor, user.followers.length)
    await user.save()
    res.sendStatus(200)
  }
}
