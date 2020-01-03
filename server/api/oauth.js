const express = require('express')
const OAuthServer = require('express-oauth-server')
const oauth = express.Router()
const oauthController = require('./controller/oauth')

const oauthServer = new OAuthServer({
  model: oauthController.model,
  useErrorHandler: true,
  debug: true,
  authenticateHandler: { handle(req) { return req.user } }
})

oauth.oauth = oauthServer
oauth.use(express.urlencoded({ extended: false }))
oauth.use(express.json())

// post token
oauth.post('/token', oauthServer.token())

oauth.get('/authorize', async (req, res, next) => {
  if (!req.user) {
    return res.redirect(`/login?redirect=${req.path}&client_id=${req.query.client_id}&redirect_uri=${req.query.redirect_uri}`)
  }

  return oauthServer.authorize()
})

oauth.post('/authorize', (req, res, next) => {
  if (!req.user) {
    return res.redirect(`/login?redirect=${req.path}&client_id=${req.query.client_id}&redirect_uri=${req.query.redirect_uri}`)
  }
  
  return oauthServer.authorize()
})

oauth.use((err, req, res, next) => {
  res.status(500).json(err)
})

// oauth.post('/login', )

module.exports = oauth