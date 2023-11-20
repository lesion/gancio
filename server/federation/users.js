const { Event, Place, APUser, Tag } = require('../api/models/models')

const escape = require('lodash/escape')
const config = require('../config')
const log = require('../log')
const settingsController = require('../api/controller/settings')
const { DateTime } = require('luxon')

module.exports = {
  get (req, res) {
    log.debug('Get actor')
    if (req.accepts('html')) { return res.redirect(301, '/') }
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
          schema: 'http://schema.org#',
          ProperyValue: 'schema:PropertyValue',
          value: 'schema:value'
        }
      ],
      id: `${config.baseurl}/federation/u/${name}`,
      type: 'Application',
      summary: config.description,
      name,
      preferredUsername: settings.instance_place,
      inbox: `${config.baseurl}/federation/u/${name}/inbox`,
      outbox: `${config.baseurl}/federation/u/${name}/outbox`,
      endpoints: { sharedInbox: `${config.baseurl}/federation/u/${name}/inbox` },
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
        url: config.baseurl + '/logo.png'
      },
      publicKey: {
        id: `${config.baseurl}/federation/u/${name}#main-key`,
        owner: `${config.baseurl}/federation/u/${name}`,
        publicKeyPem: settings.publicKey
      }
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
    const page = req.query.page
    const settings = settingsController.settings

    if (!name) {
      log.info('[AP] Bad /outbox request')
      return res.status(400).send('Bad request.')
    }
    if (name !== settings.instance_name) {
      log.info(`No record found for ${name}`)
      return res.status(404).send(`No record found for ${escape(name)}`)
    }

    const events = await Event.findAll({ include: [{ model: Tag, required: false }, Place], limit: 10 })
    log.debug(`${settings.baseurl} Inside ${name} outbox, should return all events from this instance: ${events.length}`)

    // https://www.w3.org/TR/activitypub/#outbox
    res.type('application/activity+json; charset=utf-8')
    if (!page) {
      return res.json({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${settings.baseurl}/federation/u/${name}/outbox`,
        type: 'OrderedCollection',
        totalItems: events.length,
        first: {
          id: `${settings.baseurl}/federation/u/${name}/outbox?page=true`,
          type: 'OrderedCollectionPage',
          // totalItems: events.length,
          partOf: `${settings.baseurl}/federation/u/${name}/outbox`,
          // prev: `${settings.baseurl}/federation/u/${name}/outbox`,
          // next: page !== 'last' && `${settings.baseurl}/federation/u/${name}/outbox?page=last`,
          orderedItems: page === 'last'
            ? []
            : events.map(e => ({
              id: `${settings.baseurl}/federation/m/${e.id}#create`,
              type: 'Create',
              to: ['https://www.w3.org/ns/activitystreams#Public'],
              cc: [`${settings.baseurl}/federation/u/${name}/followers`],
              published: e.createdAt,
              actor: `${settings.baseurl}/federation/u/${name}`,
              object: e.toAP(settings)
            }))
        }
      })
    }
  }
}

// log.debug(`With pagination ${page}`)
// return res.json({
//   '@context': [
//     'https://www.w3.org/ns/activitystreams'
//   ],
//   id: `${config.baseurl}/federation/u/${name}/outbox?page=true`,
//   type: 'OrderedCollectionPage',
//   // totalItems: events.length,
//   partOf: `${config.baseurl}/federation/u/${name}/outbox`,
//   // prev: `${config.baseurl}/federation/u/${name}/outbox`,
//   next: page !== 'last' && `${config.baseurl}/federation/u/${name}/outbox?page=last`,
//   orderedItems: page === 'last'
//     ? []
//     : events.map(e => ({
//       id: `${config.baseurl}/federation/m/${e.id}#create`,
//       type: 'Create',
//       to: ['https://www.w3.org/ns/activitystreams#Public'],
//       cc: [`${config.baseurl}/federation/u/${name}/followers`],
//       published: dayjs(e.createdAt).utc().format(),
//       actor: `${config.baseurl}/federation/u/${name}`,
//       object: e.toAP(name, req.settings.locale)
//     }))
// })
// }
// }
