const { Event, Place, APUser, Tag } = require('../api/models/models')

const escape = require('lodash/escape')
const config = require('../config')
const log = require('../log')
const settingsController = require('../api/controller/settings')
const { DateTime } = require('luxon')

module.exports = {
  get (req, res) {
    log.debug('[FEDI] Get actor')
    // if (req.accepts('html')) { return res.redirect(301, '/') }
    const settings = settingsController.settings
    const name = req.params.name
    if (!name) { return res.status(400).send('Bad request.') }

    if (name !== settings.instance_name) { return res.status(404).send(`No record found for ${escape(name)}`) }
    const ret = {
      '@context': [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1',
        {
          toot: 'http://joinmastodon.org/ns#',

          // A property-value pair, e.g. representing a feature of a product or place. We use this to publish this very same instance
          // https://docs.joinmastodon.org/spec/activitypub/#PropertyValue
          schema: 'http://schema.org#',
          ProperyValue: 'schema:PropertyValue',
          value: 'schema:value',

          // https://docs.joinmastodon.org/spec/activitypub/#discoverable
          "discoverable": "toot:discoverable",

          // https://docs.joinmastodon.org/spec/activitypub/#Hashtag
          "Hashtag": "https://www.w3.org/ns/activitystreams#Hashtag",

          manuallyApprovesFollowers: 'as:manuallyApprovesFollowers',

          // focal point - https://docs.joinmastodon.org/spec/activitypub/#focalPoint
          "focalPoint": {
            "@container": "@list",
            "@id": "toot:focalPoint"
          }          
        }
      ],
      id: `${config.baseurl}/federation/u/${name}`,
      type: 'Application',
      summary: config.description,
      name,
      preferredUsername: name, // settings.instance_place,
      inbox: `${config.baseurl}/federation/u/${name}/inbox`,
      outbox: `${config.baseurl}/federation/u/${name}/outbox`,
      manuallyApprovesFollowers: false,
      endpoints: { sharedInbox: `${config.baseurl}/federation/u/${name}/inbox` },
      // followers: `${config.baseurl}/federation/u/${name}/followers`,
      discoverable: true,
      attachment: [
        {
          type: 'PropertyValue',
          name: 'Website',
          value: `<a href='${config.baseurl}'>${config.baseurl}</a>`
        },
        {
          type: 'PropertyValue',
          name: 'Place',
          value: settings.instance_place
        }],
      icon: {
        type: 'Image',
        mediaType: 'image/png',
        url: config.baseurl + '/logo.png'
      },
      publicKey: {
        id: `${config.baseurl}/federation/u/${name}#main-key`,
        owner: `${config.baseurl}/federation/u/${name}`,
        publicKeyPem: settings.publicKey
      },
      url: config.baseurl,
    }
    res.type('application/activity+json; charset=utf-8')
    res.json(ret)
  },

  async followers (req, res) {
    const settings = settingsController.settings
    const name = req.params.name
    const page = req.query.page
    log.debug(`Retrieve ${name} followers`)
    if (!name) { return res.status(400).send('Bad request.') }
    if (name !== settings.instance_name) {
      log.warn('No record found')
      return res.status(404).send(`No record found for ${escape(name)}`)
    }
    const followers = await APUser.findAll({ where: { follower: true } })

    res.type('application/activity+json; charset=utf-8')

    if (!page) {
      log.debug('No pagination')
      return res.json({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${settings.baseurl}/federation/u/${name}/followers`,
        type: 'OrderedCollection',
        totalItems: followers.length,
        first: `${settings.baseurl}/federation/u/${name}/followers?page=true`
        // last: `${config.baseurl}/federation/u/${name}/followers?page=true`,
        // orderedItems: followers.map(f => f.ap_id)
      })
    }
    return res.json({
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${settings.baseurl}/federation/u/${name}/followers?page=${page}`,
      type: 'OrderedCollectionPage',
      totalItems: followers.length,
      partOf: `${settings.baseurl}/federation/u/${name}/followers`,
      orderedItems: followers.map(f => f.ap_id)
    })
  },

  async outbox (req, res) {
    const name = req.params.name
    const page = parseInt(req.query?.page)
    const events_per_page = 10
    const settings = settingsController.settings

    if (!name) {
      log.info('[AP] Bad /outbox request')
      return res.status(400).send('Bad request.')
    }
    if (name !== settings.instance_name) {
      log.info(`[FEDI] No record found for ${name} (instance name is ${settings.instance_name})`)
      return res.status(404).send(`No record found for ${escape(name)}`)
    }

    const n_events = await Event.count({ where: { is_visible: true }}) // should hide events from the fedi?
    let events = []
    log.debug(`[FEDI] GET /outbox, should return all events from this instance: ${n_events}`)
    // https://www.w3.org/TR/activitypub/#outbox
    res.type('application/activity+json; charset=utf-8')

    const last_page = Math.ceil(n_events/10)

    if (page) {
      events = await Event.findAll({ where: { is_visible: true }, include: [{ model: Tag, required: false }, Place], limit: events_per_page, offset: (page-1)*events_per_page })
      return res.json({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${config.baseurl}/federation/u/${name}/outbox?page=${page}`,
        type: 'OrderedCollectionPage',
        totalItems: events.length,
        partOf: `${config.baseurl}/federation/u/${name}/outbox`,
        ...( page > 1 && { prev: `${config.baseurl}/federation/u/${name}/outbox?page=${page-1}`}),
        ...( page !== last_page && { next: `${config.baseurl}/federation/u/${name}/outbox?page=${page+1}`}),
        orderedItems: events.map(e => ({
            id: `${config.baseurl}/federation/m/${e.id}#create`,
            type: 'Create',
            to: 'https://www.w3.org/ns/activitystreams#Public',
            published: new DateTime(e.createdAt).toISO(),
            actor: `${config.baseurl}/federation/u/${name}`,
            object: e.toAP(name)
          }))
      })      
    } else {
      return res.json({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${settings.baseurl}/federation/u/${name}/outbox`,
        type: 'OrderedCollection',
        totalItems: n_events,
        first: `${settings.baseurl}/federation/u/${name}/outbox?page=1`,
        last: `${settings.baseurl}/federation/u/${name}/outbox?page=${last_page}`
      })
    }
  }
}
