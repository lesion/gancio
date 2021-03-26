const Event = require('../api/models/event')
const Place = require('../api/models/place')
const APUser = require('../api/models/ap_user')
const Tag = require('../api/models/tag')

const config = require('config')
const log = require('../log')
const utc = require('dayjs/plugin/utc')
const dayjs = require('dayjs')
dayjs.extend(utc)

module.exports = {
  get (req, res) {
    log.debug('Get actor')
    if (req.accepts('html')) { return res.redirect(301, '/') }
    const name = req.params.name
    if (!name) { return res.status(400).send('Bad request.') }

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
        url: config.baseurl + '/logo.png'
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
    const name = req.params.name
    const page = req.query.page
    log.debug(`Retrieve ${name} followers`)
    if (!name) { return res.status(400).send('Bad request.') }
    if (name !== req.settings.instance_name) {
      log.warn('No record found')
      return res.status(404).send(`No record found for ${name}`)
    }
    const followers = await APUser.findAll({ where: { follower: true } })

    res.type('application/activity+json; charset=utf-8')

    if (!page) {
      log.debug('No pagination')
      return res.json({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${config.baseurl}/federation/u/${name}/followers`,
        type: 'OrderedCollection',
        totalItems: followers.length,
        first: `${config.baseurl}/federation/u/${name}/followers?page=true`
        // last: `${config.baseurl}/federation/u/${name}/followers?page=true`,
        // orderedItems: followers.map(f => f.ap_id)
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
    const name = req.params.name
    const page = req.query.page

    if (!name) {
      log.info('[AP] Bad /outbox request')
      return res.status(400).send('Bad request.')
    }
    if (name !== req.settings.instance_name) {
      log.info(`No record found for ${name}`)
      return res.status(404).send(`No record found for ${name}`)
    }

    const events = await Event.findAll({ include: [{ model: Tag, required: false }, Place], limit: 10 })
    log.debug(`${config.baseurl} Inside ${name} outbox, should return all events from this instance: ${events.length}`)

    // https://www.w3.org/TR/activitypub/#outbox
    res.type('application/activity+json; charset=utf-8')
    if (!page) {
      return res.json({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${config.baseurl}/federation/u/${name}/outbox`,
        type: 'OrderedCollection',
        totalItems: events.length,
        first: {
          id: `${config.baseurl}/federation/u/${name}/outbox?page=true`,
          type: 'OrderedCollectionPage',
          // totalItems: events.length,
          partOf: `${config.baseurl}/federation/u/${name}/outbox`,
          // prev: `${config.baseurl}/federation/u/${name}/outbox`,
          // next: page !== 'last' && `${config.baseurl}/federation/u/${name}/outbox?page=last`,
          orderedItems: page === 'last'
            ? []
            : events.map(e => ({
              id: `${config.baseurl}/federation/m/${e.id}#create`,
              type: 'Create',
              to: ['https://www.w3.org/ns/activitystreams#Public'],
              cc: [`${config.baseurl}/federation/u/${name}/followers`],
              published: dayjs(e.createdAt).utc().format(),
              actor: `${config.baseurl}/federation/u/${name}`,
              object: e.toAPNote(name, req.settings.locale)
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
//       object: e.toAPNote(name, req.settings.locale)
//     }))
// })
// }
// }
