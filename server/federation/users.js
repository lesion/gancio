const { user: User, event: Event, place: Place, tag: Tag, fed_users: FedUsers } = require('../api/models')
const config = require('config')
const get = require('lodash/get')
const debug = require('debug')('fediverse:user')

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
      attachment: [{
        type: 'PropertyValue',
        name: 'Website',
        value: `<a href='${config.baseurl}'>${config.baseurl}</a>`
      }],
      icon: {
        type: 'Image',
        mediaType: 'image/png',
        url: config.baseurl + '/gancio.png'
      },
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
    const page = req.query.page
    debug('Retrieve %s followers', name)
    if (!name) return res.status(400).send('Bad request.')
    const user = await User.findOne({where: { username: name }, include: { model: FedUsers, as: 'followers' }})
    if (!user) return res.status(404).send(`No record found for ${name}`)

    res.type('application/activity+json; charset=utf-8')

    if (!page) {
      debug('No pagination')
      return res.json({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${config.baseurl}/federation/u/${name}/followers`,
        type: 'OrderedCollection',
        totalItems: user.followers.length,
        first: `${config.baseurl}/federation/u/${name}/followers?page=true`,
        last: `${config.baseurl}/federation/u/${name}/followers?page=true`,
      })
    }
    return res.json({
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${config.baseurl}/federation/u/${name}/followers?page=${page}`,
      type: 'OrderedCollectionPage',
      totalItems: user.followers.length,
      partOf: `${config.baseurl}/federation/u/${name}/followers` ,
      orderedItems: user.followers        
    })
  },

  async outbox (req, res) {
    const name = req.params.name
    const page = req.query.page
    
    if (!name) return res.status(400).send('Bad request.')
    const user = await User.findOne({
      include: [ { model: Event, include: [ Place, Tag ] } ],
      where: { username: name }
    })

    if (!user) return res.status(404).send(`No record found for ${name}`)

    debug('Inside outbox, should return all events from this user')

    // https://www.w3.org/TR/activitypub/#outbox
    res.type('application/activity+json; charset=utf-8')
    if (!page) {
      debug('Without pagination ')
      return res.json({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${config.baseurl}/federation/u/${name}/outbox`,
        type: 'OrderedCollection',
        totalItems: user.events.length,
        first: `${config.baseurl}/federation/u/${name}/outbox?page=true`,
        last: `${config.baseurl}/federation/u/${name}/outbox?page=true`
      })
    }
    
    debug('With pagination %s', page)
    return res.json({
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${config.baseurl}/federation/u/${name}/outbox?page=${page}`,
      type: 'OrderedCollectionPage',
      totalItems: user.events.length,
      partOf: `${config.baseurl}/federation/u/${name}/outbox` ,
      orderedItems: user.events.map(e => ({
        id: `${config.baseurl}/federation/m/${e.id}#create`,
        type: 'Create',
        to: ['https://www.w3.org/ns/activitystreams#Public'],
        cc: [`${config.baseurl}/federation/u/${user.username}/followers`],
        published: e.createdAt,
        actor: `${config.baseurl}/federation/u/${user.username}`,
        object: e.toAP(user.username)
      }))
    })    
  }
}
