const Mastodon = require('mastodon-api')
const { setting: Setting } = require('../models')
const config = require('config')

const settingsController = {
  settings: null,
  secretSettings: null,

  // initialize instance settings from db
  async init (req, res, next) {
    if (!settingsController.settings) {
      const settings = await Setting.findAll()
      settingsController.settings = {}
      settingsController.secretSettings = {}
      settings.forEach( s => settingsController[s.is_secret?'secretSettings':'settings'][s.key] = s.value)
    }
    next()
  },

  async set(key, value, is_secret=false) {
    try {
      await Setting.findOrCreate({
        where: { key },
        defaults: { value, is_secret }
      }).spread((settings, created) => {
        if (!created) return settings.update({ value, is_secret })
      })
      settingsController[is_secret?'secretSettings':'settings'][key]=value
      console.error('settings ', settingsController.settings)
      console.error('settings controller ', settingsController.secretSettings)
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
    res.json(settingsController.settings)
  },

  async getAuthURL(req, res) {
    const instance  = req.body.instance
    console.error('DENTRO GET AUTH URL ', instance)
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

      res.redirect('/admin')
    } catch (e) {
      res.json(e)
    }
  },

}

module.exports = settingsController
