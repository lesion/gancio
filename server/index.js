#!/bin/env node
const path = require('path')
const express = require('express')
const consola = require('consola')
const morgan = require('morgan')
const { Nuxt, Builder } = require('nuxt')
const firstRun = require('./firstrun')
// Import and Set Nuxt.js options
const nuxt_config = require('../nuxt.config.js')
const config = require('./config')

const app = express()
async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(nuxt_config)

  // const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (nuxt_config.dev) {
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
  const server = app.listen(config.server)

  // close connections/port/unix socket
  function shutdown() {
    consola.info(`Closing connections..`)
    server.close()
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)

  server.on('error', e => {
    consola.error(e)
  })

  server.on('listening', () => {
    const address = server.address()
    consola.ready({
      message: `Server listening on ${(typeof address) === 'object' ? `${address.address}:${address.port}` : address}`,
      badge: true
    })
  })
}

firstRun.then(start)
