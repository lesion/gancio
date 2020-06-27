const Event = require('../api/models/event')
const Place = require('../api/models/place')
const APUser = require('../api/models/ap_user')
const Tag = require('../api/models/tag')

const config = require('config')
const debug = require('debug')('fediverse:user')

module.exports = {
  get (req, res) {
    if (req.accepts('html')) { return res.redirect(301, '/') }
    const name = req.params.name
    if (!name) { return res.status(400).send('Bad request.') }

    // const user = await User.findOne({ where: { username: name } })
    if (name !== req.settings.instance_name) { return res.status(404).send(`No record found for ${name}`) }
    const ret = {
      '@context': [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1',
        {
          toot: 'http://joinmastodon.org/ns#',
          schema: 'http://schema.org#',
          ProperyValue: 'schema:PropertyValue',
          value: 'schema:value'
        }
      ],
      id: `${config.baseurl}/federation/u/${name}`,
      type: 'Person',
      summary: config.description,
      name,
      preferredUsername: name,
      inbox: `${config.baseurl}/federation/u/${name}/inbox`,
      outbox: `${config.baseurl}/federation/u/${name}/outbox`,
      // followers: `${config.baseurl}/federation/u/${name}/followers`,
      discoverable: true,
      attachment: [{
        type: 'PropertyValue',
        name: 'Website',
        value: `<a href='${config.baseurl}'>${config.baseurl}</a>`
      }],
      icon: {
        type: 'Image',
        mediaType: 'image/png',
        url: config.baseurl + '/favicon.ico'
      },
      publicKey: {
        id: `${config.baseurl}/federation/u/${name}#main-key`,
        owner: `${config.baseurl}/federation/u/${name}`,
        publicKeyPem: req.settings.publicKey
      }
    }
    res.type('application/activity+json; charset=utf-8')
    res.json(ret)
  },

  async followers (req, res) {
    // TODO
    const name = req.params.name
    const page = req.query.page
    debug('Retrieve %s followers', name)
    if (!name) { return res.status(400).send('Bad request.') }
    if (name !== req.settings.instance_name) {
      return res.status(404).send(`No record found for ${name}`)
    }
    const followers = await APUser.findAll({ where: { follower: true } })

    res.type('application/activity+json; charset=utf-8')

    if (!page) {
      debug('No pagination')
      return res.json({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${config.baseurl}/federation/u/${name}/followers`,
        type: 'OrderedCollection',
        totalItems: followers.length,
        first: `${config.baseurl}/federation/u/${name}/followers?page=true`,
        last: `${config.baseurl}/federation/u/${name}/followers?page=true`,
        orderedItems: followers.map(f => f.ap_id)
      })
    }
    return res.json({
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${config.baseurl}/federation/u/${name}/followers?page=${page}`,
      type: 'OrderedCollectionPage',
      totalItems: followers.length,
      partOf: `${config.baseurl}/federation/u/${name}/followers`,
      orderedItems: followers.map(f => f.ap_id)
    })
  },

  async outbox (req, res) {
    // TODO
    const name = req.params.name
    const page = req.query.page

    if (!name) { return res.status(400).send('Bad request.') }
    if (name !== req.settings.instance_name) { return res.status(404).send(`No record found for ${name}`) }

    const events = await Event.findAll({ include: [Tag, Place] })

    debug('Inside outbox, should return all events from this user')

    // https://www.w3.org/TR/activitypub/#outbox
    res.type('application/activity+json; charset=utf-8')
    if (!page) {
      return res.json({
        '@context': ['https://www.w3.org/ns/activitystreams'],
        id: `${config.baseurl}/federation/u/${name}/outbox`,
        type: 'OrderedCollection',
        totalItems: events.length,
        first: `${config.baseurl}/federation/u/${name}/outbox?page=true`,
        last: `${config.baseurl}/federation/u/${name}/outbox?page=true`
      })
    }

    debug('With pagination %s', page)
    return res.json({
      '@context': ['https://www.w3.org/ns/activitystreams', { Hashtag: 'as:Hashtag' }],
      id: `${config.baseurl}/federation/u/${name}/outbox?page=${page}`,
      type: 'OrderedCollectionPage',
      totalItems: events.length,
      partOf: `${config.baseurl}/federation/u/${name}/outbox`,
      orderedItems: events.map(e => ({ ...e.toAP(name, req.settings.locale), actor: `${config.baseurl}/federation/u/${name}` }))
      //   user.events.map(e => ({
      //   id: `${config.baseurl}/federation/m/${e.id}#create`,
      //   type: 'Create',
      //   to: ['https://www.w3.org/ns/activitystreams#Public'],
      //   cc: [`${config.baseurl}/federation/u/${user.username}/followers`],
      //   published: e.createdAt,
      //   actor: `${config.baseurl}/federation/u/${user.username}`,
      //   object: e.toNoteAP(user.username)
      // }))
    })
  }
}
