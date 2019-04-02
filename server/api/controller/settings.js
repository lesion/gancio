const { Settings } = require('../model')

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
