const config = require('../config')
const Helpers = require('./helpers')
const crypto = require('crypto')
const log = require('../log')
const settingsController = require('../api/controller/settings')

module.exports = {
  // follow request from fediverse
  async follow (req, res) {
    const body = req.body
    if (typeof body.object !== 'string') { return }
    const username = body.object.replace(`${config.baseurl}/federation/u/`, '')
    if (username !== settingsController.settings.instance_name) {
      log.warn(`Following the wrong user: ${username} instead of ${settingsController.settings.instance_name} (could be a wrong config.baseurl)`)
      return res.status(404).send('User not found')
    }

    // check for duplicate
    // if (!user.followers.includes(body.actor)) {
    // await user.addFollowers([req.fedi_user.id])
    // await user.update({ followers: [...user.followers, body.actor] })
    await res.locals.fedi_user.update({ follower: true })
    log.info(`Followed by ${body.actor}`)
    const guid = crypto.randomBytes(16).toString('hex')
    const message = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${config.baseurl}/federation/${guid}`,
      type: 'Accept',
      actor: `${config.baseurl}/federation/u/${username}`,
      object: body
    }
    Helpers.signAndSend(JSON.stringify(message), res.locals.fedi_user.object.inbox)
    res.sendStatus(200)
  },

  // unfollow request from fediverse
  async unfollow (req, res) {
    const body = req.body
    const username = body.object.object.replace(`${config.baseurl}/federation/u/`, '')
    if (username !== settingsController.settings.instance_name) {
      log.warn(`Unfollowing wrong user: ${username} instead of ${settingsController.settings.instance_name}`)
      return res.status(404).send('User not found')
    }

    if (body.actor !== body.object.actor || body.actor !== res.locals.fedi_user.ap_id) {
      log.info('Unfollow an user created by a different actor !?!?')
      return res.status(400).send('Bad things')
    }
    await res.locals.fedi_user.update({ follower: false })
    log.info(`Unfollowed by ${body.actor}`)
    res.sendStatus(200)
  }
}
