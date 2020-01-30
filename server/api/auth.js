const debug = require('debug')('auth')
const oauth = require('./oauth')

const Auth = {

  /** isAuth middleware
   * req.user is filled in server/helper.js#initMiddleware
  */
  isAuth (req, res, next) {
    return oauth.oauthServer.authenticate()(req, res, next)
  },

  fillUser (req, res, next) {
    oauth.oauthServer.authenticate()(req, res, () => {
      req.user = res.locals.oauth.token.user
      next()
    })
  },

  /** isAdmin middleware */
  isAdmin (req, res, next) {
    oauth.oauthServer.authenticate()(req, res, () => {
      req.user = res.locals.oauth.token.user
      if (req.user.is_admin) {
        next()
      } else {
        res.status(404)
      }
    })
  },

  hasPerm (scope) {
    return (req, res, next) => {
      debug(scope, req.path)
      oauth.oauthServer.authenticate({ scope })(req, res, () => {
        req.user = res.locals.oauth.token.user
        next()
      })
    }
  }

}

module.exports = Auth
