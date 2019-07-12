const Mastodon = require('mastodon-api')
const { setting: Setting } = require('../models')
const config = require('config')
const settingsController = {
  settings: { initialized: false },
  secretSettings: {},

  // initialize instance settings from db
  async initialize () {
    if (!settingsController.settings.initialized) {
      const settings = await Setting.findAll()
      settingsController.settings.initialized = true
      settings.forEach( s => {
        if (s.is_secret) {
          settingsController.secretSettings[s.key] = s.value
        } else {
          settingsController.settings[s.key] = s.value
        }
      })
    }
  },

  async set(key, value, is_secret=false) {
    try {
      await Setting.findOrCreate({
        where: { key },
        defaults: { value, is_secret }
      }).spread((setting, created) => {
        if (!created) return setting.update({ value, is_secret })
      })
      settingsController[is_secret?'secretSettings':'settings'][key]=value
      return true
    } catch(e) {
      console.error(e)
      return false
    }
  },

  async setRequest(req, res) {
    const { key, value, is_secret } = req.body
    const ret = await settingsController.set(key, value, is_secret)
    if (ret) res.sendStatus(200)
    else res.sendStatus(400)
  },

  getAllRequest(req, res) {
    // get public settings and public configuration
    const settings = {
      ...settingsController.settings,
      baseurl: config.baseurl,
      title: config.title,
      description: config.description
    }
    res.json(settings)
  },

  async getAuthURL(req, res) {
    const instance  = req.body.instance
    const callback = `${config.baseurl}/api/settings/oauth`
    const { client_id, client_secret } = await Mastodon.createOAuthApp(`https://${instance}/api/v1/apps`,
      'gancio', 'read write', callback)
    const url = await Mastodon.getAuthorizationUrl(client_id, client_secret,
      `https://${instance}`, 'read write', callback)
    
    await settingsController.set('mastodon_instance', instance )
    await settingsController.set('mastodon_auth', { client_id, client_secret }, true)
    res.json(url)
  },

  async code(req, res) {
    const code = req.query.code
    const callback = `${config.baseurl}/api/settings/oauth`
    const client_id = settingsController.secretSettings.mastodon_auth.client_id
    const client_secret = settingsController.secretSettings.mastodon_auth.client_secret
    const instance = settingsController.settings.mastodon_instance

    try {
      const access_token = await Mastodon.getAccessToken(client_id, client_secret, code,
        `https://${instance}`, callback)
      const mastodon_auth = { client_id, client_secret, access_token }
      await settingsController.set('mastodon_auth', mastodon_auth, true)
      const botController = require('./bot')
      botController.initialize()
      res.redirect('/admin')
    } catch (e) {
      res.json(e)
    }
  },
}

setTimeout(settingsController.initialize, 200)
module.exports = settingsController
