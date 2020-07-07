const Setting = require('../models/setting')
const config = require('config')
const consola = require('consola')
const path = require('path')
const fs = require('fs')
const pkg = require('../../../package.json')
const debug = require('debug')('settings')
const crypto = require('crypto')
const util = require('util')
const toIco = require('to-ico')
const generateKeyPair = util.promisify(crypto.generateKeyPair)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const sharp = require('sharp')

const defaultSettings = {
  instance_timezone: 'Europe/Rome',
  instance_locale: 'en',
  instance_name: config.title.toLowerCase().replace(/ /g, ''),
  instance_place: '',
  allow_registration: true,
  allow_anon_event: true,
  allow_recurrent_event: false,
  recurrent_event_visible: false,
  enable_federation: true,
  enable_resources: false,
  hide_boosts: true,
  enable_trusted_instances: true,
  trusted_instances: []
}

/**
 * Settings controller: store instance settings
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
      const [setting, created] = await Setting.findOrCreate({
        where: { key },
        defaults: { value, is_secret }
      })

      if (!created) { setting.update({ value, is_secret }) }
      settingsController[is_secret ? 'secretSettings' : 'settings'][key] = value
      return true
    } catch (e) {
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
      return res.status(400).send('Mmmmm sould not be here!')
    }

    const uploaded_path = path.join(req.file.destination, req.file.filename)
    const logo_path = path.resolve(config.upload_path, 'favicon')
    const favicon_path = path.resolve(config.upload_path, 'favicon')

    // convert and resize to png
    sharp(uploaded_path)
      .resize(400)
      .png({ quality: 90 })
      .toFile(logo_path + '.png', async (err, info) => {
        console.error(err)
        const image = await readFile(logo_path + '.png')
        const favicon = await toIco([image], { sizes: [64], resize: true })
        writeFile(favicon_path + '.ico', favicon)
        settingsController.set('favicon', favicon_path)
        res.sendStatus(200)
      })
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

module.exports = settingsController
