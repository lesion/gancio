const log = require('../../log')
const db = require('../models/index.js')
const Umzug = require('umzug')
const path = require('path')
const config = require('../../config')
const Sequelize = require('sequelize')

const crypto = require('crypto')
const { promisify } = require('util')
const randomBytes = promisify(crypto.randomBytes)
async function randomString (len = 16) {
  const bytes = await randomBytes(len * 8)
  return crypto
    .createHash('sha1')
    .update(bytes)
    .digest('hex')
}

const setupController = {

    async setupDb (req, res, next) {
      log.debug('[SETUP] Check db')
      const dbConf = req.body.db
      if (!dbConf) {
        return res.sendStatus(400)
      }

      try {
        const sequelize = await db.connect(dbConf)
        const users = await sequelize.query('SELECT * from users').catch(e => {})
        config.db = dbConf
        if (users && users.length) {
          log.warn(' ⚠  Non empty db! Please move your current db elsewhere than retry.')
          return res.status(400).send(' ⚠  Non empty db! Please move your current db elsewhere than retry.')
        } else {
          // run migrations...
          const umzug = new Umzug({
            storage: 'sequelize',
            storageOptions: { sequelize },
            logging: log.debug.bind(log),
            migrations: {
              wrap: fun => {
                return () =>
                  fun(sequelize.queryInterface, Sequelize).catch(e => {
                    log.error(e)
                    return false
                  })
              },
              path: path.resolve(__dirname, '..', '..', 'migrations')
            }
          })
          await umzug.up()
          config.firstrun = false
          config.db.logging = false
          const settingsController = require('./settings')
          await settingsController.load()
          return res.sendStatus(200)
        }        
      } catch (e) {
        return res.status(400).send(String(e))
      }
    },

    async restart (req, res) {
      config.write()

      // create admin user
      const password = await randomString()
      const email = `admin@${req.settings.hostname}`
      const User = require('../models/user')
      await User.create({
        email,
        password,
        is_admin: true,
        is_active: true
      })

      res.json({ password, email })

      // exit process so pm2 || docker could restart me
      process.exit()
    }

}

module.exports = setupController