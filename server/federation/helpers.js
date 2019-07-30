const fetch = require('fetch')
const request = require('request')
const crypto = require('crypto')

const Helpers = {
  async signAndSend(message, user, domain, req, res, targetOrigin) {
    // get the URI of the actor object and append 'inbox' to it
    let inbox = message.object.actor+'/inbox'
    let inboxFragment = inbox.replace(targetOrigin,'')
    const targetDomain = new URL(targetOrigin).host
    // get the private key
    const privkey = user.rsa.privateKey
    const signer = crypto.createSign('sha256')
    let d = new Date()
    let stringToSign = `(request-target): post ${inboxFragment}\nhost: ${targetDomain}\ndate: ${d.toUTCString()}`
    signer.update(stringToSign)
    signer.end()
    const signature = signer.sign(privkey)
    const signature_b64 = signature.toString('base64')
    let header = `keyId="${config.baseurl}/federation/u/${user.username}",headers="(request-target) host date",signature="${signature_b64}"`
    request({
      url: inbox,
      headers: {
        'Host': targetDomain,
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
        console.log('Response:', response.body)
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
    Helpers.signAndSend(message, user, domain, req, res, targetOrigin)
  }
}

module.exports = Helpers