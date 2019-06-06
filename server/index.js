const firstRun = require('./firstrun')
const express = require('express')
const consola = require('consola')
const morgan = require('morgan')
const path = require('path')
const app = express()
const { Nuxt, Builder } = require('nuxt')
// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')

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
  app.use(morgan('dev'))
  app.use('/media/', express.static(path.join(__dirname, '..', 'uploads')))
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

firstRun.then(start)