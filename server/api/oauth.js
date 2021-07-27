const express = require('express')
const OAuthServer = require('express-oauth-server')
const oauth = express.Router()
const oauthController = require('./controller/oauth')
const log = require('../log')

const oauthServer = new OAuthServer({
  model: oauthController.model,
  allowEmptyState: true,
  useErrorHandler: true,
  continueMiddleware: false,
  debug: true,
  requireClientAuthentication: { password: false },
  authenticateHandler: {
    handle (req) {
      if (!req.user) {
        throw new Error('Not authenticated!')
      }
      return req.user
    }
  }
})

oauth.oauthServer = oauthServer
oauth.use(express.json())
oauth.use(express.urlencoded({ extended: false }))

oauth.post('/token', oauthServer.token())
oauth.post('/login', oauthServer.token())

oauth.get('/authorize', oauthServer.authorize())

oauth.use((req, res) => res.sendStatus(404))

oauth.use((err, req, res, next) => {
  const error_msg = err.toString()
  log.error('[OAUTH USE]' + error_msg)
  res.status(500).send(error_msg)
})

module.exports = oauth
