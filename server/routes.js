const path = require('path')
const config = require('config')
const express = require('express')
const cors = require('cors')
const api = require('./api')
const oauth = require('./api/oauth')
const auth = require('./api/auth')
const cookieParser = require('cookie-parser')
const federation = require('./federation')
const webfinger = require('./federation/webfinger')
const { spamFilter } = require('./federation/helpers')
const debug = require('debug')('routes')
const exportController = require('./api/controller/export')
const eventController = require('./api/controller/event')
const announceController = require('./api/controller/announce')

const helpers = require('./helpers')
const { startOfMonth, startOfWeek, getUnixTime } = require('date-fns')
const app = express()

// ignore unimplemented ping url from fediverse
app.use(spamFilter)

app.use((req, res, next) => {
  debug(req.method, req.path)
  next()
})

// serve favicon and static content
app.use('/logo.png', express.static('./static/gancio.png'))
app.use('/media/', express.static(config.upload_path))

// initialize instance settings / authentication / locale
app.use(helpers.initSettings)
app.use('/favicon.ico', (req, res, next) => {
  const favicon_path = req.settings.favicon || config.favicon || './assets/favicon.ico'
  return express.static(path.resolve(favicon_path))(req, res, next)
})

// rss/ics/atom feed
app.get('/feed/:type', cors(), exportController.export)

// federation api / activitypub / webfinger / nodeinfo
app.use('/.well-known', webfinger)
app.use('/federation', federation)

// api!
app.use(cookieParser())

// fill req.user if request is authenticated
app.use(auth.fillUser)
app.use('/api', api)
app.use('/oauth', oauth)

// // Handle 500
app.use((error, req, res, next) => {
  debug('Error 500: %s', error)
  res.status(500).send('500: Internal Server Error')
})

// remaining request goes to nuxt
// first nuxt component is ./pages/index.vue (with ./layouts/default.vue)
// prefill current events, tags, places and announcements (used in every path)
app.use(async (req, res, next) => {
  const start_datetime = getUnixTime(startOfWeek(startOfMonth(new Date())))
  req.events = await eventController._select(start_datetime, 100)
  req.meta = await eventController._getMeta()
  req.announcements = await announceController._getVisible()
  next()
})

module.exports = app
