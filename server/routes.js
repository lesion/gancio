const path = require('path')
const config = require('config')
const express = require('express')
const api = require('./api')
const federation = require('./federation')
const webfinger = require('./federation/webfinger')
const { spamFilter } = require('./federation/helpers')
const debug = require('debug')('routes')

const router = express.Router()
router.use((req, res, next) => {
  debug(req.path)
  next()
})

// ignore unimplemented ping url from fediverse
router.use(spamFilter)

router.use('/favicon.ico', express.static(path.resolve(config.favicon || 'assets/favicon.ico')))
router.use('/media/', express.static(config.upload_path))
router.use('/api', api)

// federation api / activitypub / webfinger / nodeinfo
router.use('/.well-known', webfinger)
router.use('/federation', federation)

// Handle 404
// router.use((req, res) => res.status(404).send('404: Page not found'))

// Handle 500
router.use((error, req, res, next) => {
  debug('Error 500: %s', error)
  res.status(500).send('500: Internal Server Error')
})

module.exports = router
