const express = require('express')
const OAuthServer = require('express-oauth-server')
const oauth = express.Router()
const oauthController = require('./controller/oauth')
const debug = require('debug')('oauth')

const oauthServer = new OAuthServer({
  model: oauthController.model,
  allowEmptyState: true,
  useErrorHandler: true,
  continueMiddleware: false,
  debug: true,
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

oauth.get('/authorize', oauthServer.authorize())

oauth.use((err, req, res, next) => {
  const error_msg = err.toString()
  debug(err)
  res.status(500).send(error_msg)
})

module.exports = oauth
