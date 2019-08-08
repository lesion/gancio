const fetch = require('node-fetch')
const request = require('request')
const crypto = require('crypto')
const config = require('config')
const httpSignature = require('http-signature')
const debug = require('debug')('fediverse:helpers')

const actorCache = []

const Helpers = {
  async signAndSend(message, user, to) {

    // get the URI of the actor object and append 'inbox' to it
    const toInbox = to + '/inbox'
    const toOrigin = new URL(to)
    const toPath = toInbox.replace(toOrigin.origin, '')
    // get the private key
    const privkey = user.rsa.privateKey
    const signer = crypto.createSign('sha256')
    const d = new Date()
    const stringToSign = `(request-target): post ${toPath}\nhost: ${toOrigin.hostname}\ndate: ${d.toUTCString()}`
    console.error('stringToSign ', stringToSign)

    signer.update(stringToSign)
    signer.end()
    const signature = signer.sign(privkey)
    const signature_b64 = signature.toString('base64')
    const header = `keyId="${config.baseurl}/federation/u/${user.username}",headers="(request-target) host date",signature="${signature_b64}"`
    console.error('header ', header)
    console.error('requestTo ', toInbox)
    console.error('host ', toOrigin.hostname)
    request({
      url: toInbox,
      headers: {
        'Host': toOrigin.hostname,
        'Date': d.toUTCString(),
        'Signature': header,
        'Content-Type': 'application/activity+json; charset=utf-8'
      },
      method: 'POST',
      json: true,
      body: message
    }, function (error, response){
      if (error) {
        console.log('Error:', error, response.body)
      }
      else {
        console.log('Response:', response.body, response.statusCode, response.status, response.statusMessage)
      }
    })
  },
  async sendEvent(event, user) {
    const followers = user.followers
    for(let follower of followers) {
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
    // try with cache first if not forced
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
    let user = await Helpers.getActor(req.body.actor)
    if (!user) return res.send('Actor not found', 401)

    // little hack -> https://github.com/joyent/node-http-signature/pull/83
    req.headers.authorization = 'Signature ' + req.headers.signature

    // another little hack :/ 
    // https://github.com/joyent/node-http-signature/issues/87
    req.url = '/federation' + req.url
    const parsed = httpSignature.parseRequest(req)
    if (httpSignature.verifySignature(parsed, user.publicKey.publicKeyPem)) return next()
    
    // signature not valid, try without cache
    user = await Helpers.getActor(req.body.actor, true)
    if (!user) return res.send('Actor not found', 401)
    if (httpSignature.verifySignature(parsed, user.publicKey.publicKeyPem)) return next()

    // still not valid
    res.send('Request signature could not be verified', 401)
  }
}

module.exports = Helpers
