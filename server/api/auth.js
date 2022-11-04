const log = require('../log')
const get = require('lodash/get')
const passport = require('passport')

// const oauth = require('./oauth')
// const User = require('./models/user')
// const OAuthClient = require('./models/oauth_client')
// const OAuthCode = require('./models/oauth_code')
// const OAuthToken = require('./models/oauth_token')


// const CustomStrategy = require('passport-custom').Strategy
// const LocalStrategy = require('passport-local').Strategy
// const BasicStrategy = require('passport-http').BasicStrategy
// const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
// const BearerStrategy = require('passport-http-bearer').Strategy

// console.error('dentro passport setup!')
// passport.use('authenticate', new CustomStrategy(async (req, done) => {
//   console.error('dentro authenticate strategy')

//   // check if a cookie is passed
//   const token = get(req.cookies, 'auth._token.local', null)
//   const authorization = get(req.headers, 'authorization', null)
//   if (!authorization && token) {
//     req.headers.authorization = token
//   }

//   if (!authorization && !token) {
//     return done(null, false)
//   }

//   console.error(authorization, token)
//   return done(null, false)

// }))

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
// passport.use(new LocalStrategy(
//   async (username, password, done) => {
//     console.error(`sono qui dentro local strategy cerco ${username} ${password}}`)
//     const user = await User.findOne({ where: { email: username, is_active: true } })
//     console.error(user)
//     if (!user) {
//       return done(null, false)
//     }
//     // check if password matches
//     if (await user.comparePassword(password)) {
//       console.error('compare password ok!')
//       return done(null, user)
//     }
//     return done(null, false)
//   }
// // ))

// passport.serializeUser((user, done) =>  done(null, user.id))

// passport.deserializeUser(async (id, done) => {
//   const user = await User.findByPk(id)
//   done(null, user)
// })

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients. They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens. The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate. Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header). While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
// async function verifyClient(client_id, client_secret, done) {
//   console.error('Dentro verify client ', client_id, client_secret)
//   const client = await OAuthClient.findByPk(client_id, { raw: true })
//   console.error(client)
//   if (client_secret && client_secret !== client.client_secret) {
//     return done(null, false)
//   }

//   if (client) { client.grants = ['authorization_code', 'password'] } //sure ?

//   return done(null, client)
// }

// passport.use(new BasicStrategy(verifyClient))
// passport.use(new ClientPasswordStrategy(verifyClient))

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token). If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
// passport.use(new BearerStrategy(
//   async (accessToken, done) => {
//     console.error('dentro bearer strategy')
//     const token = await OAuthToken.findByPk(accessToken,
//         { include: [{ model: User, attributes: { exclude: ['password'] } }, { model: OAuthClient, as: 'client' }] })

//     if (!token) return done(null, false)
//     if (token.userId) {
//       if (!token.user) {
//         return done(null, false)
//       }
//       // To keep this example simple, restricted scopes are not implemented,
//       // and this is just for illustrative purposes.
//       done(null, user, { scope: '*' })
//     } else {
//       // The request came from a client only since userId is null,
//       // therefore the client is passed back instead of a user.
//       if (!token.client) {
//         return done(null, false)
//       }
//       // To keep this example simple, restricted scopes are not implemented,
//       // and this is just for illustrative purposes.
//       done(null, client, { scope: '*' })
//     }
//   }
// ))

const Auth = {

  isAuth (req, res, next) {
    // TODO: check anon user
    if (req.user) {
      next()
    } else {
      res.sendStatus(403)
    }
  },

  isAdmin (req, res, next) {
    if (req.user && req.user.is_admin) {
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
