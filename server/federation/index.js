const express = require('express')
const router = express.Router()
const cors = require('cors')
const Users = require('./users')
const Event = require('../api/models/event')
const User = require('../api/models/user')
const Tag = require('../api/models/tag')
const Place = require('../api/models/place')

const Helpers = require('./helpers')
const Inbox = require('./inbox')
const log = require('../log')

/**
 * Federation is calling!
 * ref: https://www.w3.org/TR/activitypub/#Overview
 */

router.use(cors())

// is federation enabled? middleware
router.use((req, res, next) => {
  const settingsController = require('../api/controller/settings')
  if (settingsController.settings.enable_federation) { return next() }
  log.debug('Federation disabled!')
  return  res.status(401).send('Federation disabled')
})

router.use(express.json({ type: ['application/json', 'application/activity+json', 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"'] }))

router.get('/m/:event_id', async (req, res) => {
  const settingsController = require('../api/controller/settings')
  log.debug('[AP] Get event details ')
  const event_id = req.params.event_id
  if (req.accepts('html')) { return res.redirect(301, `/event/${event_id}`) }

  const event = await Event.findByPk(req.params.event_id, { include: [User, Tag, Place] })
  if (!event) { return res.status(404).send('Not found') }
  return res.json(event.toAP(settingsController.settings.instance_name, req.settings.instance_locale))
})

// get any message coming from federation
router.post('/u/:name/inbox', Helpers.verifySignature, Inbox)

router.get('/u/:name/outbox', Users.outbox)
router.get('/u/:name/followers', Users.followers)
router.get('/u/:name', Users.get)

// Handle 404
router.use((req, res) => {
  log.warn(`404 Page not found: ${req.path}`)
  res.status(404).send('404: Page not Found')
})

module.exports = router
