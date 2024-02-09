const log = require('../log')

const Auth = {

  isAuth (req, res, next) {
    // TODO: check anon user
    if (req.user && req.user.is_active) {
      next()
    } else {
      res.sendStatus(403)
    }
  },

  isAdmin (req, res, next) {
    if (req.user && req.user.is_admin && req.user.is_active) {
      next()
    } else {
      res.sendStatus(403)
    }
  },

  isAdminOrEditor (req, res, next) {
    if (req.user && req.user.is_active && (req.user.is_admin || req.user.is_editor)) {
      next()
    } else {
      res.sendStatus(403)
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
