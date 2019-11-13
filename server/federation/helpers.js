const fetch = require('node-fetch')
// const request = require('request')
const crypto = require('crypto')
const config = require('config')
const httpSignature = require('http-signature')
const debug = require('debug')('federation:helpers')
const { user: User, fed_users: FedUsers, instances: Instances } = require('../api/models')
const url = require('url')
const settingsController = require('../api/controller/settings')

const Helpers = {

  // ignore unimplemented ping url from fediverse
  spamFilter (req, res, next) {
    const urlToIgnore = [
      '/api/v1/instance',
      '/api/meta',
      '/api/statusnet/version.json',
      '/api/gnusocial/version.json',
      '/api/statusnet/config.json',
      '/poco'
    ]
    if (urlToIgnore.includes(req.path)) { return res.status(404).send('Not Found') }
    next()
  },

  async signAndSend (message, user, inbox) {
    // get the URI of the actor object and append 'inbox' to it
    const inboxUrl = new url.URL(inbox)
    const privkey = user.rsa.privateKey
    const signer = crypto.createSign('sha256')
    const d = new Date()
    const stringToSign = `(request-target): post ${inboxUrl.pathname}\nhost: ${inboxUrl.hostname}\ndate: ${d.toUTCString()}`
    signer.update(stringToSign)
    signer.end()
    const signature = signer.sign(privkey)
    const signature_b64 = signature.toString('base64')
    const header = `keyId="${config.baseurl}/federation/u/${user.username}",headers="(request-target) host date",signature="${signature_b64}"`
    const ret = await fetch(inbox, {
      headers: {
        'Host': inboxUrl.hostname,
        'Date': d.toUTCString(),
        'Signature': header,
        'Content-Type': 'application/activity+json; charset=utf-8',
        'Accept': 'application/activity+json, application/json; chartset=utf-8'
      },
      method: 'POST',
      body: JSON.stringify(message) })
    debug('sign %s => %s', ret.status, await ret.text())
  },

  async sendEvent (event, user, type = 'Create') {
    if (!settingsController.settings.enable_federation) {
      debug('event not send, federation disabled')
      return
    }

    // event is sent by user that published it and by the admin instance
    // collect followers from admin and user
    const instanceAdmin = await User.findOne({ where: { email: config.admin_email }, include: { model: FedUsers, as: 'followers' } })
    if (!instanceAdmin || !instanceAdmin.username) {
      debug('Instance admin not found (there is no user with email => %s)', config.admin_email)
      return
    }

    const recipients = {}
    instanceAdmin.followers.forEach(follower => {
      const sharedInbox = follower.object.endpoints.sharedInbox
      if (!recipients[sharedInbox]) { recipients[sharedInbox] = [] }
      recipients[sharedInbox].push(follower.ap_id)
    })

    for (const sharedInbox in recipients) {
      debug('Notify %s with event %s (from admin %s) cc => %d', sharedInbox, event.title, instanceAdmin.username, recipients[sharedInbox].length)
      const body = {
        id: `${config.baseurl}/federation/m/${event.id}#create`,
        type,
        to: ['https://www.w3.org/ns/activitystreams#Public'],
        cc: [`${config.baseurl}/federation/u/${instanceAdmin.username}/followers`, ...recipients[sharedInbox]],
        // cc: recipients[sharedInbox],
        actor: `${config.baseurl}/federation/u/${instanceAdmin.username}`,
        // object: event.toAP(instanceAdmin.username, [`${config.baseurl}/federation/u/${instanceAdmin.username}/followers`, ...recipients[sharedInbox]])
        object: event.toAP(instanceAdmin.username, recipients[sharedInbox])
      }
      body['@context'] = [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1',
        { Hashtag: 'as:Hashtag' } ]
      Helpers.signAndSend(body, instanceAdmin, sharedInbox)
    }

    // TODO
    // in case the event is published by the Admin itself do not add user
    // if (instanceAdmin.id === user.id) {
    //   debug('Event published by instance Admin')
    //   return
    // }
    // if (!user.settings.enable_federation || !user.username) {
    //   debug('Federation disabled for user %d (%s)', user.id, user.username)
    //   return
    // }

    // debug('Sending to user followers => ', user.username)
    // user = await User.findByPk(user.id, { include: { model: FedUsers, as: 'followers' } })
    // debug('Sending to user followers => ', user.followers.length)
    // recipients = {}
    // user.followers.forEach(follower => {
    //   const sharedInbox = follower.object.endpoints.sharedInbox
    //   if (!recipients[sharedInbox]) { recipients[sharedInbox] = [] }
    //   recipients[sharedInbox].push(follower.ap_id)
    // })

    // for (const sharedInbox in recipients) {
    //   debug('Notify %s with event %s (from user %s) cc => %d', sharedInbox, event.title, user.username, recipients[sharedInbox].length)
    //   const body = {
    //     id: `${config.baseurl}/federation/m/${event.id}#create`,
    //     type: 'Create',
    //     to: ['https://www.w3.org/ns/activitystreams#Public'],
    //     cc: [`${config.baseurl}/federation/u/${user.username}/followers`, ...recipients[sharedInbox]],
    //     // cc: recipients[sharedInbox],
    //     actor: `${config.baseurl}/federation/u/${user.username}`,
    //     // object: event.toAP(user.username, [`${config.baseurl}/federation/u/${user.username}/followers`, ...recipients[sharedInbox]])
    //     object: event.toAP(user.username, recipients[sharedInbox])
    //   }
    //   body['@context'] = 'https://www.w3.org/ns/activitystreams'
    //   Helpers.signAndSend(body, user, sharedInbox)
    // }
  },

  async getActor (URL, instance, force = false) {
    let fedi_user

    // try with cache first
    if (!force) {
      fedi_user = await FedUsers.findByPk(URL, { include: Instances })
      if (fedi_user) {
        if (!fedi_user.instances) {
          fedi_user.setInstance(instance)
        }
        return fedi_user
      }
    }

    fedi_user = await fetch(URL, { headers: { 'Accept': 'application/jrd+json, application/json' } })
      .then(res => {
        if (!res.ok) {
          debug('[ERR] Actor %s => %s', URL, res.statusText)
          return false
        }
        return res.json()
      })

    if (fedi_user) {
      fedi_user = await FedUsers.create({ ap_id: URL, object: fedi_user })
    }
    return fedi_user
  },

  async getInstance (actor_url, force = false) {
    actor_url = new url.URL(actor_url)
    const domain = actor_url.host
    const instance_url = `${actor_url.protocol}//${actor_url.host}`
    debug('getInstance %s', domain)
    let instance
    if (!force) {
      instance = await Instances.findByPk(domain)
      if (instance) { return instance }
    }

    instance = await fetch(`${instance_url}/api/v1/instance`, { headers: { 'Accept': 'application/json' } })
      .then(res => res.json())
      .then(instance => {
        const data = {
          stats: instance.stats,
          thumbnail: instance.thumbnail
        }
        return Instances.create({ name: instance.title, domain, data, blocked: false })
      })
      .catch(e => {
        debug(e)
        return false
      })
    return instance
  },

  // ref: https://blog.joinmastodon.org/2018/07/how-to-make-friends-and-verify-requests/
  async verifySignature (req, res, next) {
    const instance = await Helpers.getInstance(req.body.actor)
    if (!instance) { return res.status(401).send('Instance not found') }
    if (instance.blocked) {
      debug('Instance %s blocked', instance.domain)
      return res.status(401).send('Instance blocked')
    }

    let user = await Helpers.getActor(req.body.actor, instance)
    if (!user) { return res.status(401).send('Actor not found') }
    if (user.blocked) {
      debug('User %s blocked', user.ap_id)
      return res.status(401).send('User blocked')
    }

    // little hack -> https://github.com/joyent/node-http-signature/pull/83
    req.headers.authorization = 'Signature ' + req.headers.signature

    req.fedi_user = user

    // another little hack :/
    // https://github.com/joyent/node-http-signature/issues/87
    req.url = '/federation' + req.url
    const parsed = httpSignature.parseRequest(req)
    if (httpSignature.verifySignature(parsed, user.object.publicKey.publicKeyPem)) { return next() }

    // signature not valid, try without cache
    user = await Helpers.getActor(req.body.actor, instance, true)
    if (!user) { return res.status(401).send('Actor not found') }
    if (httpSignature.verifySignature(parsed, user.object.publicKey.publicKeyPem)) { return next() }

    // still not valid
    debug('Invalid signature from user %s', req.body.actor)
    res.send('Request signature could not be verified', 401)
  }
}

module.exports = Helpers
