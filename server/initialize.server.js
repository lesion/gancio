
export default async function () {
  const db = require('./api/models/index')
  await db.initialize()
  async function start (nuxt) {

    const log = require('../server/log')
    const config = require('../server/config')
    const settingsController = require('./api/controller/settings')
    const dayjs = require('dayjs')
    const timezone = require('dayjs/plugin/timezone')
    dayjs.extend(timezone)
    await settingsController.load()
    dayjs.tz.setDefault(settingsController.settings.instance_timezone)

    let TaskManager
    if (!config.firstrun) {
      TaskManager = require('../server/taskManager').TaskManager
      TaskManager.start()
    }
    log.info(`Listen on ${config.server.host}:${config.server.port}`)

    // close connections/port/unix socket
    async function shutdown () {
      if (TaskManager) { TaskManager.stop() }
      log.info('Closing DB')
      const sequelize = require('../server/api/models')
      await sequelize.close()
      process.off('SIGTERM', shutdown)
      process.off('SIGINT', shutdown)
      nuxt.close()
      process.exit()
    }
    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  }
  this.nuxt.hook('listen', start)
}
