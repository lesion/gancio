// const express = require('express')
// // const OAuthServer = require('express-oauth-server')
// const oauth2orize = require('oauth2orize')
// // const oauth = express.Router()
// // const oauthController = require('./controller/oauth')
// // const OauthClient = require('./models/oauth_client')
// // const log = require('../log')

// // const oauthServer = oauth2orize.createServer()

// /*   model: oauthController.model, */
// /*   allowEmptyState: true, */
// /*   useErrorHandler: true, */
// /*   continueMiddleware: false, */
// /*   debug: true, */
// /*   requireClientAuthentication: { password: false }, */
// /*   authenticateHandler: { */
// /*     handle (_req, res) { */
// /*       if (!res.locals.user) { */
// /*         throw new Error('Not authenticated!') */
// /*       } */
// /*       return res.locals.user */
// /*     } */
// /*   } */
// /* }) */

// // oauth.oauthServer = oauthServer
// // oauth.use(express.json())
// // oauth.use(express.urlencoded({ extended: false }))


// oauthServer.serializeClient((client, done) => done(null, client.id))
// oauthServer.deserializeClient(async (id, done) => {
//   const client = await OAuthServer.findByPk(id)
//   done(null, client)
// })


// oauth.post('/token', oauthController.token)
// oauth.post('/login', oauthController.token)
// oauth.get('/authorize', oauthController.authorize)

// oauth.use((req, res) => res.sendStatus(404))

// oauth.use((err, req, res, next) => {
//   const error_msg = err.toString()
//   log.warn('[OAUTH USE] ' + error_msg)
//   res.status(500).send(error_msg)
// })

// module.exports = oauth
