const express = require('express')
const OAuthServer = require('express-oauth-server')
const oauth = express.Router()
const bodyParser = require('body-parser')
const oauthController = require('./controller/oauth')

const oauthServer = new OAuthServer({
  model: oauthController.model,
  useErrorHandler: true,
  debug: true,
  authenticateHandler: { handle(req) { return req.user } }
})

oauth.oauth = oauthServer
oauth.use(bodyParser.json())
oauth.use(bodyParser.urlencoded({ extended: false }))

// post token
// oauth.post(oauthServer.authorize())
oauth.post('/token', (req, res, next) => {
  return oauthServer.token()(req, res, next)
    .then(code => {
      console.error('dopo il token', code)
    })
    .catch(e => console.error('nel catch ', e))
})


/**
 * create a new application
 */
oauth.get('/authorize', async (req, res, next) => {
  if (!req.user) {
    return res.redirect(`/?ref=login&redirect=${req.path}&client_id=${req.query.client_id}&redirect_uri=${req.query.redirect_uri}`)
  }

  return oauthServer.authorize()(req, res, next).then(code => {
    console.error('dentro authorize?', code)
    console.error(req.locals)
    return
    // return res.redirect(`/?ref=authorize&client_id=${req.query.client_id}&redirect_uri=${req.query.redirect_uri}&code=${code}`)
  }).catch(e => { console.error('porcodio catch ', e) })
})

oauth.post('/authorize', (req, res, next) => {
  if (!req.user) {
    return res.redirect(`/?ref=login&redirect=${req.path}&client_id=${req.query.client_id}&redirect_uri=${req.query.redirect_uri}`)
  }
  console.error('sono nel post di authorize!')
  const ret = oauthServer.authorize()
  console.error('PORCODIO ', ret)
  return ret(req, res, next).then(code => {
    console.error('DAJE CHE ARRIVO QUI ', code)
    console.error(req.locals)
    next()
  }).catch(e => console.error('CATCH ', e))
})

oauth.get('/login', (req, res) => {
  res.render('login', {
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri,
    redirect: req.query.redirect,
  })
})


oauth.use((err, req, res, next) => {
  res.status(400).json(err)
})

// oauth.post('/login', )

module.exports = oauth