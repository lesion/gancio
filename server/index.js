const { Nuxt, Builder } = require('nuxt')

// Import and Set Nuxt.js options
const nuxtConfig = require('../nuxt.config.js')
const config = require('config')
const consola = require('consola')

async function main () {
  nuxtConfig.server = config.server

  // Init Nuxt.js
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
    consola.error(e.toString())
    process.winstonLog.error(e)
    return
  }

  const { TaskManager } = require('./taskManager')
  TaskManager.start()
  const msg = `Listen on ${config.server.host}:${config.server.port} , visit me here => ${config.baseurl}`
  consola.info(msg)
  process.winstonLog.info(msg)

  // close connections/port/unix socket
  function shutdown () {
    TaskManager.stop()
    nuxt.close(async () => {
      const sequelize = require('./api/models')
      await sequelize.close()
      process.exit()
    })
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

main()
