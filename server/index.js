const { Nuxt, Builder } = require('nuxt')

// Import and Set Nuxt.js options
const nuxt_config = require('../nuxt.config.js')
const config = require('config')

async function main() {
  nuxt_config.server = config.server

  // Init Nuxt.js
  const nuxt = new Nuxt(nuxt_config)

  // Build only in dev mode
  if (nuxt_config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }
  nuxt.listen()

  // close connections/port/unix socket
  function shutdown() {
    nuxt.close(async () => {
      const db = require('./api/models')
      await db.sequelize.close()
      process.exit()
    })
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

main()
