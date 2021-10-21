export default function () {
  function start (nuxt) {
    const log = require('../server/log')
    const config = require('../server/config')
    let TaskManager
    if (!config.firstrun) {
      TaskManager = require('../server/taskManager').TaskManager
      TaskManager.start()
    }
    log.info(`Listen on ${config.server.host}:${config.server.port}`)

    // close connections/port/unix socket
    async function shutdown () {
      if (TaskManager) { TaskManager.stop() }
      nuxt.close(async () => {
        log.info('Closing DB')
        const sequelize = require('../server/api/models')
        await sequelize.close()
        process.exit()
      })
    }
    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)  
  }
  this.nuxt.hook('listen', start)
}
