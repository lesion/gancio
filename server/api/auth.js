const log = require('../log')
const oauth = require('./oauth')
const get = require('lodash/get')

const Auth = {

  fillUser (req, res, next) {
    const token = get(req.cookies, 'auth._token.local', null)
    const authorization = get(req.headers, 'authorization', null)
    if (!authorization && token) {
      req.headers.authorization = token
    }

    if (!authorization && !token) {
      return next()
    }

    oauth.oauthServer.authenticate()(req, res, () => {
      res.locals.user = get(res, 'locals.oauth.token.user', null)
      next()
    })
  },

  isAuth (req, res, next) {
    if (res.locals.user) {
      next()
    } else {
      res.sendStatus(403)
    }
  },

  isAdmin (req, res, next) {
    if (res.locals.user && res.locals.user.is_admin) {
      next()
    } else {
      res.sendStatus(403)
    }
  },

  isSuperAdmin (req, res, next) {
    if (req.user.is_admin && req.settings.isMainSite) {
      next()
    } else {
      req.status(404)
    }
  },

  // TODO
  hasPerm (scope) {
    return (req, res, next) => {
      log.debug(scope, req.path)
      oauth.oauthServer.authenticate({ scope })(req, res, err => {
        if (err) {
          next()
        } else {
          next(Error(err))
        }
      })
    }
  }
}

module.exports = Auth
