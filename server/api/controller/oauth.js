const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('cookie-session')

const { OAuthClient, OAuthToken, OAuthCode, User } = require('../models/models')

const helpers = require('../../helpers.js')
const passport = require('passport')

const get = require('lodash/get')

const BasicStrategy = require('passport-http').BasicStrategy
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
const ClientPublicStrategy = require('passport-oauth2-client-public').Strategy
const BearerStrategy = require('passport-http-bearer').Strategy
const AnonymousStrategy = require('passport-anonymous').Strategy

const oauth2orize = require('oauth2orize')
const log = require('../../log')

passport.serializeUser((user, done) =>  done(null, user.id))

passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id)
  const userInfo = {
    id: user.id,
    settings: user.settings,
    email: user.email,
    role: user.role,
    is_admin: user.role === 'admin',
    is_active: user.is_active,
  }
  done(null, userInfo)
})

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
async function verifyClient(client_id, client_secret, done) {
  const client = await OAuthClient.findByPk(client_id, { raw: true })
  if (!client) {
    return done(null, false)
  }
  if (client.client_secret && client_secret !== client.client_secret) {
    return done(null, false)
  }

  if (client) { client.grants = ['authorization_code', 'password'] } //sure ?

  return done(null, client)
}

async function verifyPublicClient (client_id, done) {
  if (client_id !== 'self') {
    return done(null, false)
  }
  try {

    const client = await OAuthClient.findByPk(client_id, { raw: true })
    done(null, client)
  } catch (e) {
    done(null, { message: e.message })
  }
}

passport.use(new AnonymousStrategy())
passport.use(new BasicStrategy(verifyClient))
passport.use(new ClientPasswordStrategy(verifyClient))
passport.use(new ClientPublicStrategy(verifyPublicClient))

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token). If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
 passport.use(new BearerStrategy({ passReqToCallback: true }, verifyToken))

async function verifyToken (req, accessToken, done) {
  const token = await OAuthToken.findByPk(accessToken,
      { include: [{ model: User, attributes: { exclude: ['password'] } }, { model: OAuthClient, as: 'client' }] })

  if (!token) return done(null, false)
  if (token.userId) {
    if (!token.user) {
      return done(null, false)
    }
    // To keep this example simple, restricted scopes are not implemented,
    // and this is just for illustrative purposes.
    done(null, token.user, { scope: '*' })
  } else {

    // The request came from a client only since userId is null,
    // therefore the client is passed back instead of a user.
    if (!token.client) {
      return done(null, false)
    }
    // To keep this example simple, restricted scopes are not implemented,
    // and this is just for illustrative purposes.
    done(null, client, { scope: '*' })
  }
}


const oauthServer = oauth2orize.createServer()


// Register serialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated. To complete the transaction, the
// user must authenticate and approve the authorization request. Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session. Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.
oauthServer.serializeClient((client, done) => {
  done(null, client.id)
})

oauthServer.deserializeClient(async (id, done) => {
  const client = await OAuthClient.findByPk(id)
  done(null, client)
})

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources. It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes. The callback takes the `client` requesting
// authorization, the `redirectUri` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application. The application issues a code, which is bound to these
// values, and will be exchanged for an access token.

oauthServer.grant(oauth2orize.grant.code(async (client, redirect_uri, user, ares, done) => {
  const authorizationCode = helpers.randomString(16);
  await OAuthCode.create({
    redirect_uri,
    authorizationCode,
    clientId: client.id,
    userId: user.id,
  })
  return done(null, authorizationCode)
}))


// Grant implicit authorization. The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application. The application issues a token, which is bound to these
// values.

oauthServer.grant(oauth2orize.grant.token((client, user, ares, done) => {
  return oauthController.issueTokens(user.id, client.clientId, done)
}))


// Exchange authorization codes for access tokens. The callback accepts the
// `client`, which is exchanging `code` and any `redirectUri` from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code. The issued access token response can include a refresh token and
// custom parameters by adding these to the `done()` call

oauthServer.exchange(oauth2orize.exchange.code(async (client, code, redirect_uri, done) => {
  const oauthCode  = await OAuthCode.findByPk(code)
  if (!oauthCode || client.id !== oauthCode.clientId || client.redirectUris !== oauthCode.redirect_uri) {
    return done(null, false)
  }
  return oauthController.issueTokens(oauthCode.userId, oauthCode.clientId, done)
}))



// Exchange user id and password for access tokens. The callback accepts the
// `client`, which is exchanging the user's name and password from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the code.
oauthServer.exchange(oauth2orize.exchange.password(async (client, username, password, scope, done) => {
  // Validate the client
  const oauthClient = await OAuthClient.findByPk(client.id)
  if (!oauthClient) { // || oauthClient.client_secret !== client.clientSecret) {
    return done(null, false)
  }
  const user = await User.findOne({ where: { email: username, is_active: true } })
  if (!user) {
    return done(null, false)
  }
  // check if password matches
  if (await user.comparePassword(password)) {
    return oauthController.issueTokens(user.id, oauthClient.id, done)
  }
  return done(null, false)
}))


// Exchange the client id and password/secret for an access token. The callback accepts the
// `client`, which is exchanging the client's id and password/secret from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the client who authorized the code.
oauthServer.exchange(oauth2orize.exchange.clientCredentials(async (client, scope, done) => {
  // Validate the client
  const oauthClient = await OAuthClient.findByPk(client.clientId)
  if (!oauthClient || oauthClient.client_secret !== client.clientSecret) {
    return done(null, false)
  }

  return oauthController.issueTokens(null, oauthClient.id, done)
}))

// issue new tokens and remove the old ones
oauthServer.exchange(oauth2orize.exchange.refreshToken(async (client, refreshToken, scope, done) => {
  // db.refreshTokens.find(refreshToken, (error, token) => {
  //   if (error) return done(error)
  //   issueTokens(token.id, client.id, (err, accessToken, refreshToken) => {
  //     if (err) {
  //       done(err, null, null)
  //     }
  //     db.accessTokens.removeByUserIdAndClientId(token.userId, token.clientId, (err) => {
  //       if (err) {
  //         done(err, null, null)
  //       }
  //       db.refreshTokens.removeByUserIdAndClientId(token.userId, token.clientId, (err) => {
  //         if (err) {
  //           done(err, null, null)
  //         }
  //         done(null, accessToken, refreshToken)
  //       })
  //     })
  //   })
  // })
}))


const oauthController = {
  
  // this is a middleware to authenticate a request
  authenticate: [
    passport.initialize(), // initialize passport
    cookieParser(), // parse cookies
    session({ secret: 'secret', resave: true, saveUninitialized: true }),
    passport.session(),
    (req, res, next) => { // retrocompatibility
      const token = get(req.cookies, 'auth._token.local', null)
      const authorization = get(req.headers, 'authorization', null)
      if (!authorization && token) {
        req.headers.authorization = token
      }
      next()
    },
    passport.authenticate(['bearer', 'oauth2-client-password', 'anonymous'], { session: false }),
    (req, res, next) => { // retrocompatibility
      console.error('dentro questo middleware ', req.user.email, req.user.is_admin)
      next()
    }
  ],

  login: [
    bodyParser.urlencoded({ extended: true }), // login is done via application/x-www-form-urlencoded form
    passport.authenticate(['oauth2-client-public'], { session: false }),
    oauthServer.token(),
    oauthServer.errorHandler()
  ],
 
  token: [
    bodyParser.urlencoded({ extended: true }), // login is done via application/x-www-form-urlencoded form
    passport.authenticate(['bearer', 'oauth2-client-password'], { session: false }),
    oauthServer.token(),
    oauthServer.errorHandler()
  ],

  authorization: [
    oauthServer.authorization(async (clientId, redirectUri, done) => {
      const oauthClient = await OAuthClient.findByPk(clientId)
      if (!oauthClient) {
        return done(null, false)
      }

      // WARNING: For security purposes, it is highly advisable to check that
      //          redirectUri provided by the client matches one registered with
      //          the server. For simplicity, this example does not. You have
      //          been warned.
      return done(null, oauthClient, redirectUri);
    }, async (client, user, done) => {
      // Check if grant request qualifies for immediate approval

      // Auto-approve
      if (client.isTrusted) return done(null, true);
      if (!user) {
        return done(null, false)
      }
      const token = await OAuthToken.findOne({ where: { clientId: client.id, userId: user.id }})
      // Auto-approve
      if (token) {
        return done(null, true)
      }
      // Otherwise ask user
      return done(null, false)

    }),
    (req, res, next) => {
      //clean old transactionID
      if(req.session.authorize){
        for(const key in req.session.authorize){
          if(key !== req.oauth2.transactionID){
            delete req.session.authorize[key];
          }
        }
      }      
      const query = new URLSearchParams({
        transactionID: req.oauth2.transactionID,
        client: req.oauth2.client.name,
        scope: req.oauth2.client.scopes,
        redirect_uri: req.oauth2.client.redirectUris
      })
      return res.redirect(`/authorize?${query.toString()}`)
    }
  ],

  decision: [
    bodyParser.urlencoded({ extended: true }),
    oauthServer.decision()
  ],

  async issueTokens(userId, clientId, done) {
    const user = await User.findByPk(userId)
    if (!user) {
      return done(null, false)
    }
    
    const refreshToken = helpers.randomString(32)
    const accessToken = helpers.randomString(32)

    const token = {
      refreshToken,
      accessToken,
      userId,
      clientId
    }

    await OAuthToken.create(token)
    return done(null, accessToken, refreshToken, { username: user.email })
  },

  // create client => http:///gancio.org/dev/oauth#create-client
  async createClient (req, res) {
    // only write scope is supported
    if (req.body.scopes && req.body.scopes !== 'event:write') {
      return res.status(422).json({ error: 'Invalid scopes' })
    }

    const client = {
      id: helpers.randomString(32),
      name: req.body.client_name,
      redirectUris: req.body.redirect_uris,
      scopes: req.body.scopes || 'event:write',
      website: req.body.website,
      client_secret: helpers.randomString(32)
    }

    try {
      await OAuthClient.create(client)
      client.client_id = client.id
      delete client.id
      res.json(client)
    } catch (e) {
      log.error('[OAUTH CLIENT]', e)
      res.status(400).json(e)
    }
  },

  async getClient (req, res) {
    const client = await OAuthClient.findByPk(req.params.client_id, { raw: true })
    if (!client) {
      return res.status(404).send('Not found!')
    }
    res.json({
      client_id: client.id,
      redirect_uris: client.redirectUris,
      name: client.name,
      website: client.website,
      scopes: client.scopes
    })
  },

  async getClients (req, res) {
    const tokens = await OAuthToken.findAll({
      include: [{ model: User, where: { id: req.user.id } }, { model: OAuthClient, as: 'client' }],
      raw: true,
      nest: true
    })
    res.json(tokens)
  }
}

module.exports = oauthController
