const fetch = require('fetch')
const request = require('request')
const crypto = require('crypto')
const config = require('config')

const Helpers = {
  async signAndSend(message, user, to) {//, domain, req, res, targetOrigin) {

    // get the URI of the actor object and append 'inbox' to it
    const toInbox = to + '/inbox'
    const toOrigin = new URL(to).hostname
    const toPath = toInbox.replace(toOrigin, '')
    // get the private key
    const privkey = user.rsa.privateKey
    const signer = crypto.createSign('sha256')
    const d = new Date()
    const stringToSign = `(request-target): post ${toPath}\nhost: ${toOrigin}\ndate: ${d.toUTCString()}`
    console.error('stringToSign ', stringToSign)

    signer.update(stringToSign)
    signer.end()
    const signature = signer.sign(privkey)
    const signature_b64 = signature.toString('base64')
    const header = `keyId="${config.baseurl}/federation/u/${user.username}",headers="(request-target) host date",signature="${signature_b64}"`
    console.error('header ', header)
    request({
      url: inbox,
      headers: {
        'Host': toOrigin,
        'Date': d.toUTCString(),
        'Signature': header
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
    return res.status(200)
  },
  async sendAcceptMessage (body, user, domain, req, res, targetOrigin) {
    const guid = crypto.randomBytes(16).toString('hex')
    let message = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      'id': `${config.baseurl}/federation/${guid}`,
      'type': 'Accept',
      'actor': `${config.baseurl}/federation/u/${user.username}`,
      'object': body,
    }
    // Helpers.signAndSend(message, user, domain, req, res, targetOrigin)
  },
  async sendEvent(event, user) {
    console.error('devo inviare un evento ai followers')
    const followers = user.followers
    console.error('send to ', followers)
    for(let follower of followers) {
      console.error('send message to ', follower)
      const body = event.toAP(user.username, follower)
      Helpers.signAndSend(body, user, follower)
    }    
  }
}

module.exports = Helpers
