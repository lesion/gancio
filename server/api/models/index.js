const Sequelize = require('sequelize')
const Umzug = require('umzug')
const path = require('path')
const config = require('../../config')
const log = require('../../log')
const settingsController = require('../controller/settings')

const db = {
  sequelize: null,
  close () {
    if (db.sequelize) {
      return db.sequelize.close()
    }
  },
  connect (dbConf = config.db) {
    log.debug(`Connecting to DB: ${JSON.stringify(dbConf)}`)
    dbConf.dialectOptions = { autoJsonMap: false }
    db.sequelize = new Sequelize(dbConf)
    return db.sequelize.authenticate()
  },
  async isEmpty () {
    const users = await db.sequelize.query('SELECT * from users').catch(e => {})
    return !(users && users.length)
  },
  async runMigrations () {
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
  async initialize () {
    if (config.status === 'READY') {
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
