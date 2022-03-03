const express = require('express')
const cookieParser = require('cookie-parser')

// const metricsController = require('./metrics')
// const promBundle = require('express-prom-bundle')
// const metricsMiddleware = promBundle({ includeMethod: true })

const config = require('./config')

if (config.status == 'READY') {
  const db = require('./api/models/index')
  db.initialize()
} else {
  if (process.env.GANCIO_DB_DIALECT) {
    const setupController = require('./api/controller/setup')
    const dbConf = {
      dialect: process.env.GANCIO_DB_DIALECT,
      storage: process.env.GANCIO_DB_STORAGE,
      host: process.env.GANCIO_DB_HOST,
      database: process.env.GANCIO_DB_DATABASE,
      username: process.env.GANCIO_DB_USERNAME,
      password: process.env.GANCIO_DB_PASSWORD,
    }

    setupController._setupDb(dbConf)
      .catch(e => { process.exit(1) })
  }

}

const helpers = require('./helpers')
const log = require('./log')
const api = require('./api')


const app = express()
app.enable('trust proxy')
app.use(helpers.logRequest)

app.use(helpers.setSite)
app.use(helpers.setUserLocale)
app.use(helpers.serveStatic())

app.use(cookieParser())


// do not handle all routes on setup
if (config.status === 'READY') {
  const cors = require('cors')
  const { spamFilter } = require('./federation/helpers')
  const oauth = require('./api/oauth')
  const auth = require('./api/auth')
  const federation = require('./federation')
  const webfinger = require('./federation/webfinger')
  const exportController = require('./api/controller/export')

  // rss/ics/atom feed
  app.get('/feed/:type', cors(), exportController.export)
  app.use('/.well-known', webfinger)
  
  app.use('/event/:slug', helpers.APRedirect)
  // federation api / activitypub / webfinger / nodeinfo
  app.use('/federation', federation)

// ignore unimplemented ping url from fediverse
  app.use(spamFilter)

  // fill res.locals.user if request is authenticated
  app.use(auth.fillUser)

  app.use('/oauth', oauth)
  // app.use(metricsMiddleware)
}

// api!
app.use('/api', api)

// // Handle 500
app.use((error, req, res, next) => {
  log.error('[ERROR]', error)
  res.status(500).send('500: Internal Server Error')
})

// remaining request goes to nuxt
// first nuxt component is ./pages/index.vue (with ./layouts/default.vue)
// prefill current events, tags, places and announcements (used in every path)
app.use(helpers.initSettings)
app.use(async (req, res, next) => {
  // const start_datetime = getUnixTime(startOfWeek(startOfMonth(new Date())))
  // req.events = await eventController._select(start_datetime, 100)
  if (config.status === 'READY') {

    const eventController = require('./api/controller/event')
    const announceController = require('./api/controller/announce')    
    res.locals.meta = await eventController._getMeta(res.locals.siteId)
    res.locals.announcements = await announceController._getVisible(res.locals.siteId)
  }
  res.locals.status = config.status
  next()
})

module.exports = app
