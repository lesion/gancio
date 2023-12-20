const express = require('express')
const router = express.Router()
const { Event, Resource, User } = require('../api/models/models')

const cors = require('cors')
const settingsController = require('../api/controller/settings')
const version = require('../../package.json').version
const url = require('url')
const log = require('../log')

router.use(cors())
function allowFederation (req, res, next) {
  // is federation enabled ?
  if (settingsController.settings.enable_federation) {
    return next()
  }
  log.debug('Federation disabled')
  res.status(404).send('Federation disabled')
}

router.get('/webfinger', allowFederation, (req, res) => {
  const settings = settingsController.settings
  if (!req.query || !req.query.resource || !req.query.resource.includes('acct:')) {
    log.debug('Bad webfinger request => ', req.query && req.query.resource)
    return res.status(400).send('Bad request. Please make sure "acct:USER@DOMAIN" is what you are sending as the "resource" query parameter.')
  }

  const resource = req.query.resource
  const domain = (new url.URL(res.locals.settings.baseurl)).host
  const [, name, req_domain] = resource.match(/acct:(.*)@(.*)/)
  if (domain !== req_domain) {
    log.warn(`Bad webfinger request, requested domain "${req_domain}" instead of "${domain}"`)
    return res.status(400).send('Bad request. Please make sure "acct:USER@DOMAIN" is what you are sending as the "resource" query parameter.')
  }
  if (name !== settings.instance_name) {
    log.warn(`User not found: ${name}`)
    return res.status(404).send(`No record found for ${name}`)
  }

  log.info(`webfinger ${resource} ${domain}`)
  const ret = {
    subject: `acct:${name}@${domain}`,
    links: [
      {
        rel: 'self',
        type: 'application/activity+json',
        href: `${settings.baseurl}/federation/u/${name}`
      }
    ]
  }
  res.set('Content-Type', 'application/jrd+json; charset=utf-8')
  res.json(ret)
})

router.get('/nodeinfo/:nodeinfo_version', async (req, res) => {
  const settings = settingsController.settings

  const usersCount = (await User.findAndCountAll()).count
  const eventsCount = (await Event.findAndCountAll()).count
  const resourcesCount = (await Resource.findAndCountAll()).count

  const ret = {
    metadata: {
      nodeDescription: settings.description,
      nodeName: settings.title,
      nodeLabel: settings.instance_place,
      nodeTimezone: settings.instance_timezone,
      nodeActor: settings.instance_name
    },
    openRegistrations: settings.allow_registration,
    protocols: ['activitypub'],
    services: { inbound: [], outbound: ['rss2.0'] },
    software: {
      name: 'gancio',
      version
    },
    version: req.params.nodeinfo_version,
    usage: {
      localComments: resourcesCount,
      localPosts: eventsCount,
      users: {
        total: usersCount
      }
    }
  }

  if (req.params.nodeinfo_version === '2.1') {
    ret.software.repository = 'https://framagit.org/les/gancio'
  }
  res.json(ret)
})

router.get('/x-nodeinfo2', async (req, res) => {
  const settings = settingsController.settings

  const usersCount = (await User.findAndCountAll()).count
  const eventsCount = (await Event.findAndCountAll()).count
  const resourcesCount = (await Resource.findAndCountAll()).count

  const ret = {
    version: '1.0',
    server: {
      baseUrl: settings.baseurl,
      name: settings.title,
      software: 'Gancio',
      version
    },
    protocols: ['activitypub'],
    openRegistrations: settingsController.settings.allow_registration,
    usage: {
      users: {
        total: usersCount
      },
      localPosts: eventsCount,
      localComments: resourcesCount
    }
  }
  res.json(ret)
})

router.get('/nodeinfo', (req, res) => {
  const settings = settingsController.settings
  const ret = {
    links: [
      { href: `${settings.baseurl}/.well-known/nodeinfo/2.0`, rel: 'http://nodeinfo.diaspora.software/ns/schema/2.0' },
      { href: `${settings.baseurl}/.well-known/nodeinfo/2.1`, rel: 'http://nodeinfo.diaspora.software/ns/schema/2.1' },
      {
        "rel": "https://www.w3.org/ns/activitystreams#Application",
        "href": `${settings.baseurl}/federation/u/${settings?.instance_name ?? 'relay' }`
      }
    ]
  }
  res.json(ret)
})

router.use('/host-meta', (req, res) => {
  const settings = settingsController.settings

  log.debug('host-meta')
  res.type('application/xml')
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
  <Link rel="lrdd" type="application/xrd+xml" template="${settings.baseurl}/.well-known/webfinger?resource={uri}"/>
</XRD>`)
})

// Handle 404
router.use((req, res) => {
  log.error('404 Page not found: ', req.path)
  res.status(404).send('404: Page not Found')
})

// Handle 500
router.use((error, req, res, next) => {
  log.error('[WEBFINGER]', error)
  res.status(500).send('500: Internal Server Error')
})

module.exports = router
