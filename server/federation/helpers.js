const fetch = require('fetch')
const request = require('request')
const crypto = require('crypto')
const config = require('config')

const Helpers = {
  async signAndSend(message, user, to) {//, domain, req, res, targetOrigin) {

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
    console.error('devo inviare un evento ai followers')
    const followers = user.followers
    console.error('send to ', followers)
    for(let follower of followers) {
      console.error('send message to ', follower)
      const body = event.toAP(user.username, follower)
      body['@context'] = 'https://www.w3.org/ns/activitystreams'
      Helpers.signAndSend(body, user, follower)
    }    
  },

  // TODO: cache
  // user: les@mastodon.cisti.org
  async getFederatedUser(address) {
    address = address.trim()
    let [ user, host ] = address.split('@')
    const url = `https://${host}/.well-known/webfinger?resource=acct:${user}@${host}`
    console.error('get federated user at => ', address, url)
    const user = await fetch(url, { headers: {'Accept': 'application/jrd+json, application/json'} })
    return user
  },

  async verifySignature(req, res) {
    console.error(req.headers['signature'])
    // https://blog.joinmastodon.org/2018/07/how-to-make-friends-and-verify-requests/
    const signature_header = req.headers['signature'].split(',')
      .map(pair => pair.split('='))
    console.error(signature_header)
    return true
  }
}

module.exports = Helpers
