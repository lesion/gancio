const settingsController = require('./api/controller/settings')
const acceptLanguage = require('accept-language')
const moment = require('moment-timezone')
const config = require('config')
const pkg = require('../package.json')

module.exports = {

  async initSettings (req, res, next) {
    await settingsController.load()
    // initialize settings
    req.settings = settingsController.settings
    req.secretSettings = settingsController.secretSettings

    req.settings.baseurl = config.baseurl
    req.settings.title = req.settings.title || config.title
    req.settings.description = req.settings.description || config.description
    req.settings.version = pkg.version

    // set locale and user locale
    const acceptedLanguages = req.headers['accept-language']
    const supportedLanguages = ['en', 'it', 'es', 'ca']
    acceptLanguage.languages(supportedLanguages)
    req.settings.locale = acceptLanguage.get(acceptedLanguages)
    req.settings.user_locale = settingsController.user_locale[req.settings.locale]
    moment.locale(req.settings.locale)
    moment.tz.setDefault(req.settings.instance_timezone)
    next()
  }

}
