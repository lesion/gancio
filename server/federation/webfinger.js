const express = require('express')
const router = express.Router()
const { user: User } = require('../api/models')
const cors = require('cors')
const settingsController = require('../api/controller/settings')
const config = require('config')
const version = require('../../package.json').version
const url = require('url')
const debug = require('debug')('webfinger')

router.use(cors())

router.get('/webfinger', async (req, res) => {
  if (!req.query || !req.query.resource || !req.query.resource.includes('acct:')) {
    debug('Bad webfinger request => %s', resource.query)
    return res.status(400).send('Bad request. Please make sure "acct:USER@DOMAIN" is what you are sending as the "resource" query parameter.')
  }

  const resource = req.query.resource
  const domain = url.parse(config.baseurl).host
  const [, name, req_domain] = resource.match(/acct:(.*)@(.*)/)

  if (domain !== req_domain) {
    debug('Bad webfinger request, requested domain "%s" instead of "%s"', req_domain, domain)
    return res.status(400).send('Bad request. Please make sure "acct:USER@DOMAIN" is what you are sending as the "resource" query parameter.')    
  }

  const user = await User.findOne({ where: { username: name } })
  if (!user) {
    debug('User not found: %s', name)
    return res.status(404).send(`No record found for ${name}`)
  }

  const ret = {
    subject: `acct:${name}@${domain}`,
    links: [
      {
        rel: 'self',
        type: 'application/activity+json',
        href: `${config.baseurl}/federation/u/${name}`
      }
    ]
  }
  res.set('Content-Type', 'application/jrd+json; charset=utf-8')
  res.json(ret)
})

router.get('/nodeinfo/:nodeinfo_version', async (req, res) => {
  const ret = {
    metadata: {
      nodeDescription: 'Gancio instance',
      nodeName: config.title
    },
    openRegistrations: settingsController.settings.allow_registration,
    protocols: ['activitypub'],
    services: { inbound: [], outbound: ['atom1.0'] },
    software: {
      name: 'gancio',
      version
    },
    usage: {
      localComments: 0,
      localPosts: 0,
      users: {
        total: 3
      }
    },
    version: req.params.nodeinfo_version
  }

  if (req.params.nodeinfo_version === '2.1') {
    ret.software.repository = 'https://framagit.org/les/gancio'
  }
  res.json(ret)
})

router.get('/x-nodeinfo2', async (req, res) => {
  const ret = {
    version: '1.0',
    server: {
      baseUrl: config.baseurl,
      name: config.title,
      software: 'Gancio',
      version
    },
    protocols: ['activitypub'],
    openRegistrations: settingsController.settings.allow_registration,
    usage: {
      users: {
        total: 10
      }
    },
    localPost: 3,
    localComments: 0
  }
  res.json(ret)
})

router.get('/nodeinfo', async (req, res) => {
  const ret = {
    links: [
      { href: `${config.baseurl}/.well-known/nodeinfo/2.0`, rel: `http://nodeinfo.diaspora.software/ns/schema/2.0` },
      { href: `${config.baseurl}/.well-known/nodeinfo/2.1`, rel: `http://nodeinfo.diaspora.software/ns/schema/2.1` }
    ]
  }
  res.json(ret)
})

router.use('/host-meta', (req, res) => {
  res.type('application/xml')
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
  <Link rel="lrdd" type="application/xrd+xml" template="${config.baseurl}/.well-known/webfinger?resource={uri}"/>
</XRD>`)
})

// Handle 404
router.use((req, res) => {
  debug('404 Page not found: %s', req.path)
  res.status(404).send('404: Page not Found')
})

// Handle 500
router.use((error, req, res, next) => {
  debug(error)
  res.status(500).send('500: Internal Server Error')
})

module.exports = router
