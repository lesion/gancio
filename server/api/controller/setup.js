const URL = require('url')
const helpers = require('../../helpers.js')
const log = require('../../log')
const db = require('../models/index.js')
const config = require('../../config')
const settingsController = require('./settings')
const path = require('path')

const setupController = {

    async setupDb (req, res, next) {
      log.debug('[SETUP] Check db')
      const dbConf = req.body.db
      if (!dbConf) {
        return res.sendStatus(400)
      }

      if (dbConf.storage) {
        dbConf.storage = path.resolve(process.env.cwd || '', dbConf.storage)
      }

      try {
        // try to connect
        dbConf.logging = false
        await db.connect(dbConf)

        // is empty ?
        const isEmpty = await db.isEmpty()
        if (!isEmpty) {
          log.warn(' ⚠  Non empty db! Please move your current db elsewhere than retry.')
          return res.status(400).send(' ⚠  Non empty db! Please move your current db elsewhere than retry.')
        }

        await db.runMigrations()

        config.db = dbConf
        config.firstrun = false
        config.db.logging = false
        const settingsController = require('./settings')
        await settingsController.load()
        return res.sendStatus(200)
      } catch (e) {
        return res.status(400).send(String(e))
      }
    },

    async restart (req, res) {

      try {

        // write configuration
        config.write()

        // calculate default settings values
        await settingsController.set('theme.is_dark', true)
        await settingsController.set('instance_name', settingsController.settings.title.toLowerCase().replace(/ /g, ''))
        await settingsController.set('baseurl', req.protocol + '://' + req.headers.host)
        await settingsController.set('hostname', new URL.URL(settingsController.settings.baseurl).hostname)

        // create admin
        const password = helpers.randomString()
        const email = `admin`
        const User = require('../models/user')
        await User.create({
          email,
          password,
          is_admin: true,
          is_active: true
        })

        res.json({ password, email })

        // exit process so pm2 || docker could restart me || service
        log.info(`Admin: ${email} / password: ${password}`)
        log.info('Restart needed')
        process.exit()
      } catch (e) {
        return res.status(400).send(String(e))
      }
    }

}

module.exports = setupController