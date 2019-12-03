const config = require('config')
const Helpers = require('./helpers')
const { user: User, fed_users: FedUsers } = require('../api/models')
const crypto = require('crypto')
const debug = require('debug')('federation:follows')

module.exports = {
  // follow request from fediverse
  async follow (req, res) {
    const body = req.body
    if (typeof body.object !== 'string') { return }
    const username = body.object.replace(`${config.baseurl}/federation/u/`, '')
    if (username !== req.settings.instance_name) { return res.status(404).send('User not found') }

    // check for duplicate
    // if (!user.followers.includes(body.actor)) {
    // await user.addFollowers([req.fedi_user.id])
    // await user.update({ followers: [...user.followers, body.actor] })
    await req.fedi_user.update({ follower: true })
    debug('Followed by %s', body.actor)
    const guid = crypto.randomBytes(16).toString('hex')
    const message = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'id': `${config.baseurl}/federation/${guid}`,
      'type': 'Accept',
      'actor': `${config.baseurl}/federation/u/${username}`,
      'object': body
    }
    Helpers.signAndSend(message, req.fedi_user.object.inbox)
    res.sendStatus(200)
  },

  // unfollow request from fediverse
  async unfollow (req, res) {
    const body = req.body
    const username = body.object.object.replace(`${config.baseurl}/federation/u/`, '')
    if (username !== req.settings.instance_name) { return res.status(404).send('User not found') }

    if (body.actor !== body.object.actor || body.actor !== req.fedi_user.ap_id) {
      debug('Unfollow an user created by a different actor !?!?')
      return res.status(400).send('Bad things')
    }
    await req.fedi_user.update({ follower: false })
    debug('Unfollowed by %s', body.actor)
    res.sendStatus(200)
  }
}
