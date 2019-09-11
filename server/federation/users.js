const { user: User, event: Event } = require('../api/models')
const config = require('config')
const get = require('lodash/get')

module.exports = {
  async get (req, res) {
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
      name: user.display_name || user.username,
      preferredUsername: user.username,
      inbox: `${config.baseurl}/federation/u/${name}/inbox`,
      outbox: `${config.baseurl}/federation/u/${name}/outbox`,
      followers: `${config.baseurl}/federation/u/${name}/followers`,
      publicKey: {
        id: `${config.baseurl}/federation/u/${name}#main-key`,
        owner: `${config.baseurl}/federation/u/${name}`,
        publicKeyPem: get(user, 'rsa.publicKey', '')
      }
    }
    res.type('application/activity+json; charset=utf-8')
    res.json(ret)
  },
  async followers (req, res) {
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
  },
  async outbox (req, res) {
    const name = req.params.name
    const page = req.query.page

    if (!name) return res.status(400).send('Bad request.')
    const user = await User.findOne({
      include: [ Event ],
      where: { username: name }
    })

    if (!user) return res.status(404).send(`No record found for ${name}`)    

    console.error('Inside outbox, should return all events from this user')
    // https://www.w3.org/TR/activitypub/#outbox
    if (!page) {
      const ret = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${config.baseurl}/federation/u/${name}/outbox`,
        type: 'OrderedCollection',
        totalItems: user.events.length,
        first: {
          id: `${config.baseurl}/federation/u/${name}/outbox?page=true`,
          type: 'OrderedCollectionPage',
          totalItem: user.events.length,
          partOf: `${config.baseurl}/federation/u/${name}/outbox`,
          orderedItems: user.events.map(e => e.toAP(user.username))    
        }
      }
      res.type('application/activity+json; charset=utf-8')
      return res.json(ret)
    }
    const ret = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${config.baseurl}/federation/u/${name}/outbox?page=true`,
      type: 'OrderedCollectionPage',
      partOf: `${config.baseurl}/federation/u/${name}/outbox`,
      orderedItems: user.events.map(e => e.toAP(user.username))
    }
    res.type('application/activity+json; charset=utf-8')
    res.json(ret)
  }
}
