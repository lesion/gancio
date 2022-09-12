const Sequelize = require('sequelize')

// this is an hack: https://github.com/sequelize/sequelize/pull/14800
const livePatchMariaDBDialect = require('sequelize/lib/dialects/mariadb/query')
livePatchMariaDBDialect.prototype.handleJsonSelectQuery = () => null

const Umzug = require('umzug')
const path = require('path')
const config = require('../../config')
const log = require('../../log')
const settingsController = require('../controller/settings')

const db = {
  sequelize: null,
  close() {
    if (db.sequelize) {
      return db.sequelize.close()
    }
  },
  connect(dbConf = config.db) {
    dbConf.dialectOptions = { autoJsonMap: true }
    log.debug(`Connecting to DB: ${JSON.stringify(dbConf)}`)
    if (dbConf.dialect === 'sqlite') {
      dbConf.retry = {
        match: [
          Sequelize.ConnectionError,
          Sequelize.ConnectionTimedOutError,
          Sequelize.TimeoutError,
          /Deadlock/i,
          /SQLITE_BUSY/],
        max: 15
      }
    }
    db.sequelize = new Sequelize(dbConf)
    return db.sequelize.authenticate()
  },
  async isEmpty() {
    try {
      const users = await db.sequelize.query('SELECT * from users')
      return !(users && users.length)
    } catch (e) {
      return true
    }
  },
  async runMigrations() {
    const logging = config.status !== 'READY' ? false : log.debug.bind(log)
    const umzug = new Umzug({
      storage: 'sequelize',
      storageOptions: { sequelize: db.sequelize },
      logging,
      migrations: {
        wrap: fun => {
          return () =>
            fun(db.sequelize.queryInterface, Sequelize).catch(e => {
              // log.error(e)
              return false
            })
        },
        path: path.resolve(__dirname, '..', '..', 'migrations')
      }
    })
    return umzug.up()
  },
  async initialize() {
    if (config.status === 'CONFIGURED') {
      try {
        await db.connect()
        log.debug('Running migrations')
        await db.runMigrations()
        return settingsController.load()
      } catch (e) {
        log.warn(` ⚠️ Cannot connect to db, check your configuration => ${e}`)
        process.exit(1)
      }
    }
  }
}

module.exports = db
