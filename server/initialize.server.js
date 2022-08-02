const config = require('../server/config')

const initialize = {
  // close connections/port/unix socket
  async shutdown (exit = true) {
    if (config.status == 'READY') {
      const log = require('../server/log')
      const TaskManager = require('../server/taskManager').TaskManager
      if (TaskManager) { TaskManager.stop() }
      log.info('Closing DB')
      const sequelize = require('../server/api/models')
      await sequelize.close()
    }
    process.off('SIGTERM', initialize.shutdown)
    process.off('SIGINT', initialize.shutdown)
    if (exit) {
      process.exit()
    }
  },

  async start () {
    const log = require('../server/log')
    const settingsController = require('./api/controller/settings')
    const db = require('./api/models/index')
    const dayjs = require('dayjs')
    const timezone = require('dayjs/plugin/timezone')
    dayjs.extend(timezone)
    if (config.status == 'CONFIGURED') {
      await db.initialize()
      config.status = 'READY'
    } else {
      if (process.env.GANCIO_DB_DIALECT) {
        const setupController = require('./api/controller/setup')
        const dbConf = {
          dialect: process.env.GANCIO_DB_DIALECT,
          storage: process.env.GANCIO_DB_STORAGE,
          host: process.env.GANCIO_DB_HOST,
          port: process.env.GANCIO_DB_PORT,
          database: process.env.GANCIO_DB_DATABASE,
          username: process.env.GANCIO_DB_USERNAME,
          password: process.env.GANCIO_DB_PASSWORD,
        }
    
        await setupController._setupDb(dbConf)
          .catch(e => {
            log.warn(String(e))
            process.exit(1)
          })
      }
      await settingsController.load()
    }
  
    dayjs.tz.setDefault(settingsController.settings.instance_timezone)
  
    let TaskManager
    if (config.status === 'READY' && process.env.NODE_ENV == 'production') {
      TaskManager = require('../server/taskManager').TaskManager
      TaskManager.start()
    }
  
    process.on('SIGTERM', initialize.shutdown)
    process.on('SIGINT', initialize.shutdown)
  }
}


module.exports = initialize