const express = require('express')
const router = express.Router()
const { user: User } = require('../api/models')
const config = require('config')

router.get('/u/:name', async (req, res) => {
  const name = req.params.name
  if (!name) return res.status(400).send('Bad request.')
  const user = await User.findOne({where: { username: name }})
  if (!user) return res.status(404).send(`No record found for ${name}`)
  const domain = 'local'
  const ret = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1'
    ],
    'id': `${config.baseurl}/federation/u/${name}`,
    'type': 'Person',
    'preferredUsername': name,
    'inbox': `${config.baseurl}/federation/inbox`,
    'followers': `${config.baseurl}/federation/u/${name}/followers`,
    'publicKey': {
      'id': `${config.baseurl}/federation/u/${name}#main-key`,
      'owner': `${config.baseurl}/federation/u/${name}`,
      'publicKeyPem': user.pubkey
    }
  }
  res.json(ret)
})
module.exports = router
