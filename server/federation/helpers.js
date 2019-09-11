const fetch = require('node-fetch')
// const request = require('request')
const crypto = require('crypto')
const config = require('config')
const httpSignature = require('http-signature')
const debug = require('debug')('fediverse:helpers')
const { user: User } = require('../api/models')
const url = require('url')

const actorCache = []

const Helpers = {
  async signAndSend(message, user, to) {
    // get the URI of the actor object and append 'inbox' to it
    const toInbox = to + '/inbox'
    const toOrigin = url.parse(to)
    const toPath = toOrigin.path + '/inbox'
    // get the private key
    const privkey = user.rsa.privateKey
    const signer = crypto.createSign('sha256')
    const d = new Date()
    const stringToSign = `(request-target): post ${toPath}\nhost: ${toOrigin.hostname}\ndate: ${d.toUTCString()}`

    signer.update(stringToSign)
    signer.end()
    const signature = signer.sign(privkey)
    const signature_b64 = signature.toString('base64')
    const header = `keyId="${config.baseurl}/federation/u/${user.username}",headers="(request-target) host date",signature="${signature_b64}"`
    return await fetch(toInbox, {
      headers: {
        'Host': toOrigin.hostname,
        'Date': d.toUTCString(),
        'Signature': header,
        'Content-Type': 'application/activity+json; charset=utf-8',
        'Accept': 'application/activity+json, application/json; chartset=utf-8'
      },
      method: 'POST',
      body: JSON.stringify(message) })

  },

  async sendEvent(event, user) {
    // TODO: has to use sharedInbox!
    // event is sent by user that published it and by the admin instance
    const instanceAdmin = await User.findOne({where: { email: config.admin }})
    if(!instanceAdmin) return

    for(let follower of instanceAdmin.followers) {
      debug('Notify %s with event %s', follower, event.title)
      const body = event.toAP(instanceAdmin.username, follower)
      body['@context'] = 'https://www.w3.org/ns/activitystreams'
      Helpers.signAndSend(body, user, follower)
    }
    
    // in case the event is published by the Admin itself do not republish
    if (instanceAdmin.id === user.id) return
    for(let follower of user.followers) {
      debug('Notify %s with event %s', follower, event.title)
      const body = event.toAP(user.username, follower)
      body['@context'] = 'https://www.w3.org/ns/activitystreams'
      Helpers.signAndSend(body, user, follower)
    }
  },

  async getFederatedUser(address) {
    address = address.trim()
    const [ username, host ] = address.split('@')
    const url = `https://${host}/.well-known/webfinger?resource=acct:${username}@${host}`
    return Helpers.getActor(url)
  },
  
  // TODO: cache
  async getActor(url, force=false) {
    // try with cache first
    if (!force && actorCache[url]) return actorCache[url]
    const user = await fetch(url, { headers: {'Accept': 'application/jrd+json, application/json'} })
      .then(res => {
        if (!res.ok) {
          debug('[ERR] Actor %s => %s', url, res.statusText)
          return false
        }
        return res.json()
      })
    actorCache[url] = user
    return user
  },

  // ref: https://blog.joinmastodon.org/2018/07/how-to-make-friends-and-verify-requests/
  async verifySignature(req, res, next) {
    debug('Inside verify signature', req.body.actor)
    let user = await Helpers.getActor(req.body.actor)
    if (!user) return res.status(401).send('Actor not found')

    // little hack -> https://github.com/joyent/node-http-signature/pull/83
    req.headers.authorization = 'Signature ' + req.headers.signature

    // another little hack :/ 
    // https://github.com/joyent/node-http-signature/issues/87
    req.url = '/federation' + req.url
    const parsed = httpSignature.parseRequest(req)
    if (httpSignature.verifySignature(parsed, user.publicKey.publicKeyPem)) return next()
    
    // signature not valid, try without cache
    user = await Helpers.getActor(req.body.actor, true)
    if (!user) return res.status(401).send('Actor not found')
    if (httpSignature.verifySignature(parsed, user.publicKey.publicKeyPem)) return next()

    // still not valid
    debug('Invalid signature from user %s', req.body.actor)
    res.send('Request signature could not be verified', 401)
  }
}

module.exports = Helpers
