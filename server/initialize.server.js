const config = require('../server/config')
const db = require('./api/models/index')
const log = require('../server/log')
const { Settings } = require('luxon')

db.initialize()

const settingsController = require('./api/controller/settings')

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
    if (config.status == 'CONFIGURED') {
      await db.sequelize.authenticate()
      log.debug('Running migrations')
      await db.runMigrations()
      await db.fixMariaDBJSON()
      await settingsController.load()
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
  
    Settings.defaultLocale = settingsController.settings.instance_locale
    Settings.defaultZone = settingsController.settings.instance_timezone
  
    let TaskManager
    if (config.status === 'READY' && process.env.NODE_ENV != 'test') {
      TaskManager = require('../server/taskManager').TaskManager
      TaskManager.start()
    }
  
    process.on('SIGTERM', initialize.shutdown)
    process.on('SIGINT', initialize.shutdown)
  }
}


module.exports = initialize