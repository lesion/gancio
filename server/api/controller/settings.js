const { setting: Setting, user: User } = require('../models')
const config = require('config')
const consola = require('consola')
const path = require('path')
const fs = require('fs')
const pkg = require('../../../package.json')
const debug = require('debug')('settings')
const crypto = require('crypto')
const util = require('util')
const generateKeyPair = util.promisify(crypto.generateKeyPair)

const defaultSettings = {
  instance_timezone: 'Europe/Rome',
  instance_name: config.title.toLowerCase().replace(/ /g, ''),
  allow_registration: true,
  allow_anon_event: true,
  allow_recurrent_event: false,
  recurrent_event_visible: false,
  enable_federation: true,
  enable_resources: false,
  hide_boosts: true
}

/**
 * Settings controller: store instance settings
 * Current supported settings:
 *
 * Usage:
 *   backend/fediverse/api:
 *
 *   frontend:
 */

const settingsController = {
  settings: { initialized: false },
  user_locale: {},
  secretSettings: {},

  async load () {
    if (!settingsController.settings.initialized) {
      // initialize instance settings from db
      // note that this is done only once when the server starts
      // and not for each request (it's a kind of cache)!
      const settings = await Setting.findAll()
      settingsController.settings.initialized = true
      settingsController.settings = defaultSettings
      settings.forEach(s => {
        if (s.is_secret) {
          settingsController.secretSettings[s.key] = s.value
        } else {
          settingsController.settings[s.key] = s.value
        }
      })

      // add pub/priv instance key if needed
      if (!settingsController.settings.publicKey) {
        debug('Instance priv/pub key not found')
        const { publicKey, privateKey } = await generateKeyPair('rsa', {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
          }
        })

        await settingsController.set('publicKey', publicKey)
        await settingsController.set('privateKey', privateKey, true)
      }

      // initialize user_locale
      if (config.user_locale && fs.existsSync(path.resolve(config.user_locale))) {
        const user_locale = fs.readdirSync(path.resolve(config.user_locale))
        user_locale.forEach(async f => {
          consola.info(`Loading user locale ${f}`)
          const locale = path.basename(f, '.js')
          settingsController.user_locale[locale] =
            (await require(path.resolve(config.user_locale, f))).default
        })
      }
    }
  },

  async set (key, value, is_secret = false) {
    try {
      await Setting.findOrCreate({
        where: { key },
        defaults: { value, is_secret }
      }).spread((setting, created) => {
        if (!created) { return setting.update({ value, is_secret }) }
      })
      settingsController[is_secret ? 'secretSettings' : 'settings'][key] = value
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  },

  getUserLocale (req, res) {
    // load user locale specified in configuration
    res.json(settingsController.user_locale)
  },

  async setRequest (req, res) {
    const { key, value, is_secret } = req.body
    const ret = await settingsController.set(key, value, is_secret)
    if (ret) { res.sendStatus(200) } else { res.sendStatus(400) }
  },

  getAllRequest (req, res) {
    // get public settings and public configuration
    const settings = {
      ...settingsController.settings,
      baseurl: config.baseurl,
      title: config.title,
      description: config.description,
      version: pkg.version
    }
    res.json(settings)
  }
}

// settingsController.initialize()
module.exports = settingsController
