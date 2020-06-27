const express = require('express')
const router = express.Router()
const cors = require('cors')
const Follows = require('./follows')
const Users = require('./users')
const Event = require('../api/models/event')
const User = require('../api/models/user')
const Tag = require('../api/models/tag')
const Place = require('../api/models/place')

const settingsController = require('../api/controller/settings')
const Resources = require('./resources')
const Helpers = require('./helpers')
const Ego = require('./ego')
const debug = require('debug')('federation')

/**
 * Federation is calling!
 * ref: https://www.w3.org/TR/activitypub/#Overview
 */

router.use(cors())

// is federation enabled? middleware
router.use((req, res, next) => {
  if (settingsController.settings.enable_federation) { return next() }
  debug('Federation disabled!')
  res.status(401).send('Federation disabled')
  next(false)
})

router.use(express.json({ type: ['application/json', 'application/activity+json', 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"'] }))

router.get('/m/:event_id', async (req, res) => {
  const event_id = req.params.event_id
  if (req.accepts('html')) { return res.redirect(301, `/event/${event_id}`) }

  const event = await Event.findByPk(req.params.event_id, { include: [User, Tag, Place] })
  if (!event) { return res.status(404).send('Not found') }
  return res.json(event.toAP(event.user.username, req.settings.locale))
})

// get any message coming from federation
// Federation is calling!
router.post('/u/:name/inbox', Helpers.verifySignature, async (req, res) => {
  const b = req.body
  debug(b.type)
  switch (b.type) {
    case 'Follow':
      Follows.follow(req, res)
      break
    case 'Undo':
      // unfollow || unlike || unboost
      if (b.object.type === 'Follow') {
        Follows.unfollow(req, res)
      } else if (b.object.type === 'Like') {
        Ego.unbookmark(req, res)
      } else if (b.object.type === 'Announce') {
        Ego.unboost(req, res)
      }
      break
    case 'Announce':
      Ego.boost(req, res)
      break
    case 'Note':
      debug('This is a note! I probably should create a comment here')
      break
    case 'Like':
      Ego.bookmark(req, res)
      break
    case 'Delete':
      await Resources.remove(req, res)
      break
    case 'Create':
      // this is a reply
      if (b.object.type === 'Note') {
        debug('Create a resource!')
        await Resources.create(req, res)
      } else if (b.object.type === 'Event') {
        debug('Event type is coming!!')
      } else {
        // await Resources.create(req, res)
        debug('Create with unsupported Object or not a reply => %s ', b.object.type)
      }
      break
  }
})

function redirect_on_html_accepted (req, res, next) {
  if (req.accepts('html')) {
    return res.redirect(settingsController.settings.baseurl)
  }
  return next()
}

router.get('/u/:name/outbox', Users.outbox)
router.get('/u/:name/followers', Users.followers)
router.get('/u/:name', redirect_on_html_accepted, Users.get)

// Handle 404
router.use((req, res) => {
  debug('404 Page not found: %s', req.path)
  res.status(404).send('404: Page not Found')
})

module.exports = router
