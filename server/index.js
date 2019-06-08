#!/bin/env node
const path = require('path')
const express = require('express')
const consola = require('consola')
const morgan = require('morgan')
const { Nuxt, Builder } = require('nuxt')
const firstRun = require('./firstrun')
// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')

const app = express()
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
