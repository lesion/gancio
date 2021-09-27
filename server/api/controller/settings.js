const config = require('../../config')
const path = require('path')
const fs = require('fs')
const pkg = require('../../../package.json')
const crypto = require('crypto')
const util = require('util')
const generateKeyPair = util.promisify(crypto.generateKeyPair)
const sharp = require('sharp')
const log = require('../../log')

const defaultSettings = {
  title: 'Gancio',
  description: 'A shared agenda for local communities',
  instance_timezone: 'Europe/Rome',
  instance_locale: 'en',
  instance_name: 'gancio', // config.title.toLowerCase().replace(/ /g, ''),
  instance_place: '',
  allow_registration: true,
  allow_anon_event: true,
  allow_recurrent_event: false,
  recurrent_event_visible: false,
  enable_federation: true,
  enable_resources: false,
  hide_boosts: true,
  enable_trusted_instances: true,
  trusted_instances: [],
  'theme.is_dark': false,
  'theme.primary': '#FF4500',
  footerLinks: [
    { href: '/', label: 'home' },
    { href: '/about', label: 'about' }
  ]
}

/**
 * Settings controller: store instance settings
 */

const settingsController = {
  settings: { initialized: false },
  user_locale: {},
  secretSettings: {},

  async load () {
    if (config.firstrun) {
      settingsController.settings = defaultSettings
      return
    }
    const Setting = require('../models/setting')
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
        log.info('Instance priv/pub key not found, generating....')
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
          log.info(`Loading user locale ${f}`)
          const locale = path.basename(f, '.js')
          settingsController.user_locale[locale] =
            (await require(path.resolve(config.user_locale, f))).default
        })
      }
    }
  },

  async set (key, value, is_secret = false) {
    const Setting = require('../models/setting')
    log.info(`SET ${key} ${is_secret ? '*****' : value}`)
    try {
      const [setting, created] = await Setting.findOrCreate({
        where: { key },
        defaults: { value, is_secret }
      })
      if (!created) { setting.update({ value, is_secret }) }
      settingsController[is_secret ? 'secretSettings' : 'settings'][key] = value
      return true
    } catch (e) {
      log.error('[SETTING SET]', e)
      return false
    }
  },

  async setRequest (req, res) {
    const { key, value, is_secret } = req.body
    const ret = await settingsController.set(key, value, is_secret)
    if (ret) { res.sendStatus(200) } else { res.sendStatus(400) }
  },

  setLogo (req, res) {
    if (!req.file) {
      settingsController.set('logo', false)
      return res.status(200)
    }

    const uploadedPath = path.join(req.file.destination, req.file.filename)
    const baseImgPath = path.resolve(config.upload_path, 'logo')

    // convert and resize to png
    return sharp(uploadedPath)
      .resize(400)
      .png({ quality: 90 })
      .toFile(baseImgPath + '.png', (err, info) => {
        if (err) {
          log.error('[LOGO] ' + err)
        }
        settingsController.set('logo', baseImgPath)
        res.sendStatus(200)
      })
  },

  getAllRequest (req, res) {
    // get public settings and public configuration
    res.json({ ...settingsController.settings, version: pkg.version })
  }
}

module.exports = settingsController
