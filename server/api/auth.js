const debug = require('debug')('auth')
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
      req.user = get(res, 'locals.oauth.token.user', null)
      next()
    })
  },

  isAuth (req, res, next) {
    if (req.user) {
      next()
    } else {
      res.sendStatus(404)
    }
  },

  isAdmin (req, res, next) {
    if (req.user.is_admin) {
      next()
    } else {
      res.status(404)
    }
  },

  // TODO
  hasPerm (scope) {
    return (req, res, next) => {
      debug(scope, req.path)
      oauth.oauthServer.authenticate({ scope })(req, res, () => {
        debug('has perm')
        next()
      })
    }
  }

}

module.exports = Auth
