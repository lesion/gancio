const settingsController = require('./api/controller/settings')
const { user: User } = require('./api/models')
const { Op } = require('sequelize')
const acceptLanguage = require('accept-language')
const expressJwt = require('express-jwt')
const moment = require('moment-timezone')
const config = require('config')
const pkg = require('../package.json')

const jwt = expressJwt({
  secret: config.secret,
  credentialsRequired: false,
  getToken: function fromHeaderOrQuerystring (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1]
    } else if (req.cookies && req.cookies['auth._token.local']) {
      const [ prefix, token ] = req.cookies['auth._token.local'].split(' ')
      if (prefix === 'Bearer') { return token }
    }
    return null
  }
})

module.exports = {
  initMiddleware (req, res, next) {
    // initialize settings
    req.settings = settingsController.settings
    req.secretSettings = settingsController.secretSettings

    req.settings.baseurl = config.baseurl
    req.settings.title = config.title
    req.settings.description = config.description
    req.settings.version = pkg.version

    // set locale and user locale
    const acceptedLanguages = req.headers['accept-language']
    const supportedLanguages = ['en', 'it', 'es']
    acceptLanguage.languages(supportedLanguages)
    req.settings.locale = acceptLanguage.get(acceptedLanguages)
    req.settings.user_locale = settingsController.user_locale[req.settings.locale]
    moment.locale(req.settings.locale)

    // auth
    jwt(req, res, async () => {
      if (!req.user) { return next() }
      req.user = await User.findOne({
        where: { id: { [Op.eq]: req.user.id }, is_active: true } })
      next()
    })
  }
}
