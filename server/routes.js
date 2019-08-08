const path = require('path')
const config = require('config')
const express = require('express')
const api = require('./api')
const federation = require('./federation')
const webfinger = require('./federation/webfinger')

const router = express.Router()
router.use('/favicon.ico', express.static(path.resolve(config.favicon || 'assets/favicon.ico')))
router.use('/media/', express.static(config.upload_path))
router.use('/api', api)

// federation api / activitypub / webfinger / nodeinfo
router.use('/.well-known', webfinger)
router.use('/federation', federation)

module.exports = router
