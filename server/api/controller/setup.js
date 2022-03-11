const URL = require('url')
const helpers = require('../../helpers.js')
const log = require('../../log')
const db = require('../models/index.js')
const config = require('../../config')
const settingsController = require('./settings')
const path = require('path')
const escape = require('lodash/escape')

const setupController = {

    async _setupDb (dbConf) {

      if (!dbConf) {
        throw Error('Empty DB configuration')
      }

      if (dbConf.dialect === 'sqlite' && dbConf.storage) {
        dbConf.storage = path.resolve(process.env.cwd || '', dbConf.storage)
      } else {
        dbConf.storage = ''
      }

      // try to connect
      dbConf.logging = false
      await db.connect(dbConf)

      // is empty ?
      const isEmpty = await db.isEmpty()
      if (!isEmpty) {
        log.warn(' ⚠  Non empty db! Please move your current db elsewhere than retry.')
        throw Error(' ⚠  Non empty db! Please move your current db elsewhere than retry.')
      }

      await db.runMigrations()

      config.db = dbConf
      config.status = 'DBCONF'
      config.db.logging = false

    },

    async setupDb (req, res) {
      log.debug('[SETUP] Check db')
      const dbConf = req.body.db

      try {
        await setupController._setupDb(dbConf)
      } catch (e) {
        return res.status(400).send(String(e))
      }

      return res.sendStatus(200)
    },

    async restart (req, res) {

      try {

        config.baseurl = req.protocol + '://' + req.headers.host
        config.hostname = new URL.URL(config.baseurl).hostname
  
        // write configuration
        config.write()

        // calculate default settings values
        await settingsController.set('theme.is_dark', true)
        await settingsController.set('instance_name', settingsController.settings.title.toLowerCase().replace(/ /g, ''))
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
        log.info('Restart needed')
        
        res.end()

        // exit process so pm2 || docker could restart me || service
        setTimeout(() => process.kill(process.pid), 1000)

      } catch (e) {
        log.error(String(e))
        return res.status(400).send(escape(String(e)))
      }
    }

}

module.exports = setupController