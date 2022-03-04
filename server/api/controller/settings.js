const path = require('path')
const URL = require('url')
const fs = require('fs')
const crypto = require('crypto')
const { promisify } = require('util')
const sharp = require('sharp')
const config = require('../../config')
const pkg = require('../../../package.json')
const generateKeyPair = promisify(crypto.generateKeyPair)
const log = require('../../log')
const locales = require('../../../locales/index')
const escape = require('lodash/escape')


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
  allow_recurrent_event: false,
  recurrent_event_visible: false,
  enable_federation: true,
  enable_resources: false,
  hide_boosts: true,
  enable_trusted_instances: true,
  trusted_instances: [],
  enable_multisite: true,
  'theme.is_dark': true,
  'theme.primary': '#FF4500',
  footerLinks: [
    { href: '/', label: 'home' },
    { href: '/about', label: 'about' }
  ],
  admin_email: config.admin_email || '',
  smtp: config.smtp || false
}

/**
 * Settings controller: store instance settings
 */

const settingsController = {
  settings: { initialized: false },
  user_locale: {},
  secretSettings: {},

  async load () {
    if (config.status !== 'READY') {
      settingsController.settings = defaultSettings
      return
    }
    require('../models/setting')
    // if (settingsController.settings.initialized) return
    // settingsController.settings.initialized = true
    // initialize instance settings from db
    // note that this is done only once when the server starts
    // and not for each request
    // return
    // const settings = await Setting.findAll()
    // settingsController.settings = defaultSettings
    // settings.forEach(s => {
    //   if (s.is_secret) {
    //     settingsController.secretSettings[s.key] = s.value
    //   } else {
    //     settingsController.settings[s.key] = s.value
    //   }
    // })

    // add pub/priv instance key if needed
    // TODO
    // if (!settingsController.settings.publicKey) {
    //   log.info('Instance priv/pub key not found, generating....')
    //   const { publicKey, privateKey } = await generateKeyPair('rsa', {
    //     modulusLength: 4096,
    //     publicKeyEncoding: {
    //       type: 'spki',
    //       format: 'pem'
    //     },
    //     privateKeyEncoding: {
    //       type: 'pkcs8',
    //       format: 'pem'
    //     }
    //   })

    //   await settingsController.set('publicKey', publicKey)
    //   await settingsController.set('privateKey', privateKey, true)
    // }

    // initialize user_locale
    if (config.user_locale && fs.existsSync(path.resolve(config.user_locale))) {
      const user_locales_files = fs.readdirSync(path.resolve(config.user_locale))
        user_locales_files.forEach( f => {
        const locale = path.basename(f ,'.json')
        if (locales[locale]) {
          log.info(`Adding custom locale ${locale}`)
          settingsController.user_locale[locale] = require(path.resolve(config.user_locale, f)).default
        } else {
          log.warning(`Unknown custom user locale: ${locale} [valid locales are ${locales}]`)
        }
      })
    }

    // load custom plugins
    const plugins_path = path.resolve(process.env.cwd || '', 'plugins')
    if (fs.existsSync(plugins_path)) {
      const notifier = require('../../notifier')
      const pluginsFile = fs.readdirSync(plugins_path).filter(e => path.extname(e).toLowerCase() === '.js')
      pluginsFile.forEach( pluginFile => {
        try {
          const plugin = require(path.resolve(plugins_path, pluginFile))
          if (typeof plugin.load !== 'function') return
          plugin.load({ settings: settingsController.settings })
          log.info(`Plugin ${pluginFile} loaded!`)
          if (typeof plugin.onEventCreate === 'function') {
            notifier.emitter.on('Create', plugin.onEventCreate)
          }
          if (typeof plugin.onEventDelete === 'function') {
            notifier.emitter.on('Delete', plugin.onEventDelete)
          }
          if (typeof plugin.onEventUpdate === 'function') {
            notifier.emitter.on('Update', plugin.onEventUpdate)
          }
        } catch (e) {
          log.warn(`Unable to load plugin ${pluginFile}: ${String(e)}`)
        }
      })
    }
  },

  async getAll (siteId) {
    const Setting = require('../models/setting')
    const settingsRecords = await Setting.findAll({ where: { siteId } })
    const settings = {}
    settingsRecords.forEach(s => { settings[s.key] = s.value })
    settings.isMainSite = siteId === 0
    return Object.assign({}, defaultSettings, settings)
  },

  async set (key, value, siteId=0, is_secret = false) {
    const Setting = require('../models/setting')
    log.info(`SET ${key} ${is_secret ? '*****' : value}`)
    try {
      const [setting, created] = await Setting.findOrCreate({
        where: { key, siteId },
        defaults: { value, is_secret, siteId }
      })
      if (!created) { setting.update({ value, is_secret, siteId }) }
      settingsController[is_secret ? 'secretSettings' : 'settings'][key] = value
      return true
    } catch (e) {
      console.error(e)
      log.error('[SETTING SET]', e)
      return false
    }
  },

  async setRequest (req, res) {
    const { key, value, is_secret } = req.body
    const ret = await settingsController.set(key, value, res.locals.siteId, is_secret)
    if (ret) { res.sendStatus(200) } else { res.sendStatus(400) }
  },

  async testSMTP (req, res) {
    const smtp = req.body
    await settingsController.set('smtp', smtp.smtp, res.locals.siteId)
    const mail = require('../mail')
    try {
      await mail._send(settingsController.settings.admin_email, 'test')

      return res.sendStatus(200)
    } catch (e) {
      console.error(e)
      return res.status(400).send(escape(String(e)))
    }
  },

  setLogo (req, res) {
    if (!req.file) {
      settingsController.set('logo', false, res.locals.siteId)
      return res.status(200)
    }

    const uploadedPath = path.join(req.file.destination, res.locals.file.filename)
    const baseImgPath = path.resolve(config.upload_path, 'logo')

    // convert and resize to png
    return sharp(uploadedPath)
      .resize(400)
      .png({ quality: 90 })
      .toFile(baseImgPath + '.png', (err, info) => {
        if (err) {
          log.error('[LOGO] ' + err)
        }
        settingsController.set('logo', baseImgPath, res.locals.siteId)
        res.sendStatus(200)
      })
  }
}

module.exports = settingsController
