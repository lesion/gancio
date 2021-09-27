const Sequelize = require('sequelize')
const config = require('../../config')
const log = require('../../log')

const db = {
  sequelize: null,
  close () {
    return db.sequelize.close()
  },
  async connect (dbConf = config.db) {
    log.debug(`Connecting to DB: ${dbConf}`)
    db.sequelize = new Sequelize(dbConf)
    await db.sequelize.authenticate()
    return db.sequelize
  }
}

if (!config.firstrun) {
  try {
    db.connect()
  } catch (e) {
    log.warn(` ⚠️ Cannot connect to db, check your configuration => ${e}`)
    process.exit(1)
  }
}

module.exports = db
