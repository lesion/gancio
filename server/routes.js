const express = require('express')
const cookieParser = require('cookie-parser')

const initialize = require('./initialize.server')
initialize.start()

// const metricsController = require('./metrics')
// const promBundle = require('express-prom-bundle')
// const metricsMiddleware = promBundle({ includeMethod: true })
const config = require('./config')

const helpers = require('./helpers')
const log = require('./log')
const api = require('./api')


const app = express()
app.enable('trust proxy')
app.use(helpers.logRequest)

app.use(helpers.initSettings)
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
  
  app.use('/event/:slug', helpers.APRedirect)
  
  // federation api / activitypub / webfinger / nodeinfo
  app.use('/federation', federation)
  app.use('/.well-known', webfinger)

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
app.use((error, _req, res, _next) => {
  log.error('[ERROR]', error)
  return res.status(500).send('500: Internal Server Error')
})

// remaining request goes to nuxt
// first nuxt component is ./pages/index.vue (with ./layouts/default.vue)
// prefill current events, tags, places and announcements (used in every path)
app.use(async (req, res, next) => {
  if (config.status === 'READY') {

    const eventController = require('./api/controller/event')
    const announceController = require('./api/controller/announce')    
    res.locals.meta = await eventController._getMeta()
    res.locals.announcements = await announceController._getVisible()
  }
  res.locals.status = config.status
  next()
})

module.exports = {
  handler: app,
  load () {
    console.error('dentro load !')
  },
  unload: initialize.shutdown
  // async unload () {
  //   const db = require('./api/models/index')
  //   await db.close()
    // process.off('SIGTERM')
    // process.off('SIGINT')    
  // }
}
