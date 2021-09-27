const { Nuxt, Builder } = require('nuxt')

// Import and Set Nuxt.js options
const nuxtConfig = require('../nuxt.config.js')
const config = require('./config')
const log = require('./log')

async function main () {
  nuxtConfig.server = config.server

  // Init Nuxt.js
  if (!nuxtConfig.dev) {
    nuxtConfig.buildModules = []
  }
  const nuxt = new Nuxt(nuxtConfig)

  // Build only in dev mode
  if (nuxtConfig.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  try {
    await nuxt.listen()
  } catch (e) {
    log.error({ message: e.message })
    return
  }

  let TaskManager
  if (!config.firstrun) {
    TaskManager = require('./taskManager').TaskManager
    TaskManager.start()
  }
  const msg = `Listen on ${config.server.host}:${config.server.port} , visit me here => ${config.baseurl}`
  log.info(msg)

  // close connections/port/unix socket
  function shutdown () {
    if (TaskManager) { TaskManager.stop() }
    nuxt.close(async () => {
      log.info('Closing DB')
      const sequelize = require('./api/models')
      await sequelize.close()
      process.exit()
    })
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

main()
