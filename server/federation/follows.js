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
    const user = await User.findOne({ where: { username }, include: [ FedUsers ] })
    if (!user) { return res.status(404).send('User not found') }

    // check for duplicate
    if (!user.fed_users.includes(body.actor)) {
      await user.addFed_users([req.fedi_user.id])
      // await user.update({ followers: [...user.followers, body.actor] })
      debug('%s followed by %s (%d)', username, body.actor, user.fed_users.length+1)
    } else {
      debug('duplicate %s followed by %s', username, body.actor)
    }
    const guid = crypto.randomBytes(16).toString('hex')
    const message = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'id': `${config.baseurl}/federation/${guid}`,
      'type': 'Accept',
      'actor': `${config.baseurl}/federation/u/${user.username}`,
      'object': body
    }
    Helpers.signAndSend(message, user, body.actor)
    res.sendStatus(200)
  },

  // unfollow request from fediverse
  async unfollow (req, res) {
    const body = req.body
    const username = body.object.object.replace(`${config.baseurl}/federation/u/`, '')
    const user = await User.findOne({ where: { username } })
    if (!user) { return res.status(404).send('User not found') }

    if (body.actor !== body.object.actor || body.actor !== req.fedi_user.id) {
      debug('Unfollow an user created by a different actor !?!?')
      return res.status(400).send('Bad things')
    }

    if (req.fedi_user) await user.removeFed_users(req.fedi_user.id)
    debug('%s unfollowed by %s', username, body.actor)
    res.sendStatus(200)
  }
}
