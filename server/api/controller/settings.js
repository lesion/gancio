const { Settings } = require('../model')
const { SHARED_CONF } = require('../../../config')
const Mastodon = require('mastodon-api')

const settingsController = {
  async setAdminSetting (key, value) {
    await Settings.findOrCreate({ where: { key },
      defaults: { value } })
      .spread((settings, created) => {
        if (!created) return settings.update({ value })
      })
  },

  async getAdminSettings (req, res) {
    const settings = await settingsController.settings()
    res.json(settings)
  },

  async getAuthURL(req, res) {
    const instance = req.body.instance
    const callback = `${SHARED_CONF.baseurl}/api/settings/oauth`
    const { client_id, client_secret } = await Mastodon.createOAuthApp(`https://${instance}/api/v1/apps`,
      SHARED_CONF.title, 'read write', callback)
    const url = await Mastodon.getAuthorizationUrl(client_id, client_secret,
      `https://${instance}`, 'read write', callback)

    await settingsController.setAdminSetting('mastodon_auth', { client_id, client_secret, instance })
    res.json(url)
  },

  async code(req, res) {
    const code = req.query.code
    let client_id, client_secret, instance
    const callback = `${SHARED_CONF.baseurl}/api/settings/oauth`
    console.error('sono dentro CODEEEEEEEEEE', code)

    const settings = await settingsController.settings()

    console.log(settings);
    ({ client_id, client_secret, instance } = settings.mastodon_auth)

    try {
      const token = await Mastodon.getAccessToken(client_id, client_secret, code,
        `https://${instance}`, callback)
      const mastodon_auth = { client_id, client_secret, access_token: token, instance }
      console.error(mastodon_auth)
      await settingsController.setAdminSetting('mastodon_auth', mastodon_auth)
      
      res.redirect('/admin')
    } catch (e) {
      res.json(e)
    }
  },

  async settings () {
    const settings = await Settings.findAll()
    const map = {}
    settings.forEach(setting => {
      map[setting.key] = setting.value
    })
    return map
  }
}

module.exports = settingsController
