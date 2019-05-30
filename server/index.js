const express = require('express')
const consola = require('consola')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const cors = require('cors')
const notifier = require('./notifier')

const corsConfig = {
  allowedHeaders: ['Authorization'],
  exposeHeaders: ['Authorization']
}


// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(cors(corsConfig))
  app.use(morgan('dev'))
  app.use('/media/', express.static(path.join(__dirname, '..', 'uploads')))
  app.use(cookieParser())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
notifier.startLoop(20)
