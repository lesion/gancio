const path = require('path')
const config = require('config')
const express = require('express')
const cors = require('cors')
const api = require('./api')
const oauth = require('./api/oauth')
const cookieParser = require('cookie-parser')
const federation = require('./federation')
const webfinger = require('./federation/webfinger')
const { spamFilter } = require('./federation/helpers')
const debug = require('debug')('routes')
const exportController = require('./api/controller/export')
const helpers = require('./helpers')
const app = express()

app.use((req, res, next) => {
  debug(req.path)
  next()
})

// ignore unimplemented ping url from fediverse
app.use(spamFilter)

// serve favicon and static content
app.use('/favicon.ico', express.static(path.resolve(config.favicon || './assets/favicon.ico')))
app.use('/logo.png', express.static('./static/gancio.png'))
app.use('/media/', express.static(config.upload_path))

// get instance settings
app.use(cookieParser())
app.use(helpers.initMiddleware)

app.use('/oauth', oauth)

// rss/ics/atom feed
app.get('/feed/:type', cors(), exportController.export)

// api!
app.use('/api', api)

// federation api / activitypub / webfinger / nodeinfo
app.use('/.well-known', webfinger)
app.use('/federation', federation)

// // Handle 500
// app.use((error, req, res, next) => {
//   debug('Error 500: %s', error)
//   res.status(500).send('500: Internal Server Error')
// })

// remaining request goes to nuxt
// first nuxt component is ./pages/index.vue

module.exports = app
