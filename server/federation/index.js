const express = require('express')
const router = express.Router()
const config = require('config')
const bodyParser = require('body-parser')
const cors = require('cors')
const Follows = require('./follows')
const Users = require('./users')

/**
 * Federation is calling!
 * ref: https://www.w3.org/TR/activitypub/#Overview
 */
router.use(cors())
router.use(bodyParser.json({type: 'application/activity+json'}))

// get any message coming from federation
// Federation is calling!
router.post('/u/:name/inbox', async (req, res) => {
  const b = req.body
  console.error('> INBOX ', b.type, b)
  const targetOrigin = new URL(b.actor).origin
  const domain = new URL(config.baseurl).host

  switch(b.type) {
    case 'Follow':
      Follows.follow(req, res, b, targetOrigin, domain)
      break
    case 'Undo':
      Follows.unfollow(req, res, b, targetOrigin, domain)
      break
    case 'Announce':
      console.error('This is a boost ?')
      break
    case 'Note':
      console.error('this is a note ! I should not receive this')
      break
    case 'Create':
      console.error('Create what? This is probably a reply', b.object.type)
      break
  }
})

router.get('/u/:name/outbox', Users.outbox)
router.get('/u/:name/followers', Users.followers)
router.get('/u/:name', Users.get)

module.exports = router
