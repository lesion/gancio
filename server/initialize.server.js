
module.exports = function () {
  const config = require('../server/config')
  config.load()
  const log = require('../server/log')
  const settingsController = require('./api/controller/settings')
  const db = require('./api/models/index')
  const dayjs = require('dayjs')
  const timezone = require('dayjs/plugin/timezone')
  async function start (nuxt) {

    if (config.status == 'READY') {
      await db.initialize()
    } else {
      if (process.env.GANCIO_DB_DIALECT) {
        const setupController = require('./api/controller/setup')
        const dbConf = {
          dialect: process.env.GANCIO_DB_DIALECT,
          storage: process.env.GANCIO_DB_STORAGE,
          host: process.env.GANCIO_DB_HOST,
          database: process.env.GANCIO_DB_DATABASE,
          username: process.env.GANCIO_DB_USERNAME,
          password: process.env.GANCIO_DB_PASSWORD,
        }
    
        setupController._setupDb(dbConf)
          .catch(e => { process.exit(1) })
      }
    }

    dayjs.extend(timezone)
    await settingsController.load()
    // dayjs.tz.setDefault(settingsController.settings.instance_timezone)

    let TaskManager
    if (config.status === 'READY' && process.env.NODE_ENV == 'production') {
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

  return start(this.nuxt)
}
