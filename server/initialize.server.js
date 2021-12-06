
export default async function () {
    const log = require('../server/log')
    const config = require('../server/config')
    const settingsController = require('./api/controller/settings')
    const dayjs = require('dayjs')
    const timezone = require('dayjs/plugin/timezone')
    const db = require('./api/models/index')
    dayjs.extend(timezone)
    await db.initialize()
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
      process.exit()
    }
    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
}
