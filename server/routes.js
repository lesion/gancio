const path = require('path')
const config = require('config')
const express = require('express')
const cors = require('cors')
const api = require('./api')
const cookieParser = require('cookie-parser')
const federation = require('./federation')
const webfinger = require('./federation/webfinger')
const { spamFilter } = require('./federation/helpers')
const debug = require('debug')('routes')
const exportController = require('./api/controller/export')
const helpers = require('./helpers')
const router = express.Router()

router.use((req, res, next) => {
  debug(req.path)
  next()
})

// ignore unimplemented ping url from fediverse
router.use(spamFilter)

// serve favicon and static content
router.use('/favicon.ico', express.static(path.resolve(config.favicon || './assets/favicon.ico')))
router.use('/media/', express.static(config.upload_path))

// get instance settings
router.use(cookieParser())
router.use(helpers.initMiddleware)

// rss/ics/atom feed
router.get('/feed/:type', cors(), exportController.export)

// api!
router.use('/api', api)

// federation api / activitypub / webfinger / nodeinfo
router.use('/.well-known', webfinger)
router.use('/federation', federation)

// Handle 500
router.use((error, req, res, next) => {
  debug('Error 500: %s', error)
  res.status(500).send('500: Internal Server Error')
})

// remaining request goes to nuxt
// first nuxt component is ./pages/index.vue

module.exports = router
