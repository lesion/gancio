const express = require('express')
const router = express.Router()
const { user: User } = require('../api/models')
const config = require('config')
const get = require('lodash/get')
const crypto = require('crypto')
const request = require('request')

function signAndSend(message, usre, domain, req, res, targetDomain) {
  // get the URI of the actor object and append 'inbox' to it
  let inbox = message.object.actor+'/inbox'
  let inboxFragment = inbox.replace('https://'+targetDomain,'')
  // get the private key
  const privkey = user.rsa.privateKey
  const signer = crypto.createSign('sha256')
  let d = new Date()
  let stringToSign = `(request-target): post ${inboxFragment}\nhost: ${targetDomain}\ndate: ${d.toUTCString()}`
  signer.update(stringToSign)
  signer.end()
  const signature = signer.sign(privkey)
  const signature_b64 = signature.toString('base64')
  let header = `keyId="https://${domain}/u/${name}",headers="(request-target) host date",signature="${signature_b64}"`
  console.error('vado di request accept !')
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
  return res.status(200);
}

function sendAcceptMessage (body, user, req, res, targetDomain) {
  const guid = crypto.randomBytes(16).toString('hex')
  let message = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    'id': `${config.baseurl}/federation/${guid}`,
    'type': 'Accept',
    'actor': `${config.baseurl}/federation/u/${user.username}`,
    'object': body,
  }
  signAndSend(message, user, domain, req, res, targetDomain)
}

router.post('/inbox', async (req, res) => {
  const b = req.body
  console.error('> INBOX ', b)
  const targetDomain = new URL(b.actor).host
  const domain = new URL(config.baseurl).host
  switch(b.type) {
    case 'Follow':
      if (typeof b.object !== 'string') return
      const username = b.object.replace(`${config.baseurl}/federation/u/`, '')
      console.error('someone wants to follow ' + username)
      const user = await User.findOne({ where: { username }})
      if (!user) {
        console.error('No user found!')
        return
      }
      sendAcceptMessage(b, user, domain, req, res, targetDomain)
      console.error('FOLLOWERS ', user.followers)
      if (user.followers.indexOf(b.actor) === -1) {
        console.error('ok this is a new follower: ', b.actor)
        user.followers.push(b.actor)
        await user.save()
      }

      break
  }
})

router.get('/u/:name', async (req, res) => {
  const name = req.params.name
  if (!name) return res.status(400).send('Bad request.')
  const user = await User.findOne({where: { username: name }})
  if (!user) return res.status(404).send(`No record found for ${name}`)
  const ret = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1'
    ],
    id: `${config.baseurl}/federation/u/${name}`,
    type: 'Person',
    preferredUsername: name,
    inbox: `${config.baseurl}/federation/inbox`,
    followers: `${config.baseurl}/federation/u/${name}/followers`,
    publicKey: {
      id: `${config.baseurl}/federation/u/${name}#main-key`,
      owner: `${config.baseurl}/federation/u/${name}`,
      publicKeyPem: get(user, 'rsa.publicKey', '')
    }
  }
  res.json(ret)
})

router.get('/u/:name/followers', async (req, res) => {
  const name = req.params.name
  if (!name) return res.status(400).send('Bad request.')
  const user = await User.findOne({where: { username: name }})
  if (!user) return res.status(404).send(`No record found for ${name}`)
  const ret = {
    '@context': [ 'https://www.w3.org/ns/activitystreams' ],
    id: `${config.baseurl}/federation/u/${name}/followers`,
    type: 'OrderedCollection',
    totalItems: user.followers.length,
    first: {
      id: `${config.baseurl}/federation/u/${name}/followers?page=1`,
      type: 'OrderedCollectionPage',
      totalItems: user.followers.length,
      partOf: `${config.baseurl}/federation/u/${name}/followers`,
      orderedItems: user.followers,
    }
  }
  res.json(ret)
})


module.exports = router