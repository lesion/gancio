const path = require('path')
const URL = require('url')
const fs = require('fs')
const crypto = require('crypto')
const { promisify } = require('util')
const sharp = require('sharp')
const config = require('../../config')
const generateKeyPair = promisify(crypto.generateKeyPair)
const log = require('../../log')
// const locales = require('../../../locales/index')
const escape = require('lodash/escape')
const pluginController = require('./plugins')

let defaultHostname
try {
  defaultHostname = new URL.URL(config.baseurl).hostname
} catch (e) {}

const defaultSettings = {
  title: config.title || 'Gancio',
  description: config.description || 'A shared agenda for local communities',
  baseurl: config.baseurl || '',
  hostname: defaultHostname,
  instance_timezone: 'Europe/Rome',
  instance_locale: 'en',
  instance_name: 'gancio',
  instance_place: '',
  allow_registration: true,
  allow_anon_event: true,
  allow_multidate_event: true,
  allow_recurrent_event: false,
  recurrent_event_visible: false,
  allow_geolocation: true,
  enable_federation: true,
  enable_resources: false,
  hide_boosts: true,
  enable_trusted_instances: true,
  trusted_instances: [],
  'theme.is_dark': true,
  'theme.primary': '#FF4500',
  trusted_instances_label: '',
  hide_thumbs: false,
  hide_calendar: false,
  footerLinks: [
    { href: '/', label: 'common.home' },
    { href: '/about', label: 'common.about' }
  ],
  plugins: [],
  admin_email: config.admin_email || '',
  smtp: config.smtp || {}
}

/**
 * Settings controller: store instance settings
 */

const settingsController = {
  settings: { initialized: false },
  user_locale: {},
  secretSettings: {},

  async load () {
    if (config.status !== 'CONFIGURED') {
      settingsController.settings = defaultSettings
      return
    }
    if (settingsController.settings.initialized) return
    settingsController.settings.initialized = true
    // initialize instance settings from db
    // note that this is done only once when the server starts
    // and not for each request
    const Setting = require('../models/setting')
    const settings = await Setting.findAll()
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
    // if (config.user_locale && fs.existsSync(path.resolve(config.user_locale))) {
    //   const user_locales_files = fs.readdirSync(path.resolve(config.user_locale))
    //     user_locales_files.forEach( f => {
    //     const locale = path.basename(f ,'.json')
    //     if (locales[locale]) {
    //       log.info(`Adding custom locale ${locale}`)
    //       settingsController.user_locale[locale] = require(path.resolve(config.user_locale, f)).default
    //     } else {
    //       log.warning(`Unknown custom user locale: ${locale} [valid locales are ${locales}]`)
    //     }
    //   })
    // }

    pluginController._load()
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

  async testSMTP (req, res) {
    const smtp = req.body
    await settingsController.set('smtp', smtp.smtp)
    const mail = require('../mail')
    try {
      await mail._send(settingsController.settings.admin_email, 'test')

      return res.sendStatus(200)
    } catch (e) {
      console.error(e)
      return res.status(400).send(escape(String(e)))
    }
  },

  getSMTPSettings (_req, res) {
    return res.json(settingsController['settings']['smtp'])
  },

  getAll (_req, res) {
    return res.json(settingsController.settings)
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
      .toFile(baseImgPath + '.png', (err) => {
        if (err) {
          log.error('[LOGO] ' + err)
        }
        settingsController.set('logo', baseImgPath)
        res.sendStatus(200)
      })
  },

  setFallbackImage (req, res) {
    if (!req.file) {
      settingsController.set('fallback_image', false)
      return res.status(200)
    }

    const uploadedPath = path.join(req.file.destination, req.file.filename)
    const baseImgPath = path.resolve(config.upload_path, 'fallbackImage.png')

    // convert and resize to png
    return sharp(uploadedPath)
      .resize(600)
      .png({ quality: 99 })
      .toFile(baseImgPath, (err) => {
        if (err) {
          log.error('[FALLBACK IMAGE] ' + err)
        }
        settingsController.set('fallback_image', baseImgPath)
        res.sendStatus(200)
      })
  },

  setHeaderImage (req, res) {
    if (!req.file) {
      settingsController.set('header_image', false)
      return res.status(200)
    }

    const uploadedPath = path.join(req.file.destination, req.file.filename)
    const baseImgPath = path.resolve(config.upload_path, 'fallbackImage.png')

    // convert and resize to png
    return sharp(uploadedPath)
      .resize(600)
      .png({ quality: 99 })
      .toFile(baseImgPath, (err) => {
        if (err) {
          log.error('[HEADER IMAGE] ' + err)
        }
        settingsController.set('header_image', baseImgPath)
        res.sendStatus(200)
      })
  }

}

module.exports = settingsController
