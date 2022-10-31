const crypto = require('crypto')
const { promisify } = require('util')
const randomBytes = promisify(crypto.randomBytes)

const OAuthClient = require('../models/oauth_client')
const OAuthToken = require('../models/oauth_token')
const OAuthCode = require('../models/oauth_code')
const User = require('../models/user')

const log = require('../../log')
const dayjs = require('dayjs')

async function randomString (len = 16) {
  const bytes = await randomBytes(len * 8)
  return crypto
    .createHash('sha1')
    .update(bytes)
    .digest('hex')
}

const oauthController = {

  // create client => http:///gancio.org/oauth#create-client
  async createClient (req, res) {
    // only write scope is supported
    if (req.body.scopes && req.body.scopes !== 'event:write') {
      return res.status(422).json({ error: 'Invalid scopes' })
    }

    const client = {
      id: await randomString(256),
      name: req.body.client_name,
      redirectUris: req.body.redirect_uris,
      scopes: req.body.scopes || 'event:write',
      website: req.body.website,
      client_secret: await randomString(256)
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
      include: [{ model: User, where: { id: res.locals.user.id } }, { model: OAuthClient, as: 'client' }],
      raw: true,
      nest: true
    })
    res.json(tokens)
  },

  model: {

    /**
     * Invoked to retrieve an existing access token previously saved through #saveToken().
     * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#getaccesstoken-accesstoken-callback
     * */
    async getAccessToken (accessToken) {
      const oauth_token = await OAuthToken.findByPk(accessToken,
        { include: [{ model: User, attributes: { exclude: ['password'] } }, { model: OAuthClient, as: 'client' }] })
      return oauth_token
    },

    /**
     * Invoked to retrieve a client using a client id or a client id/client secret combination, depend on the grant type.
     */
    async getClient (client_id, client_secret) {
      const client = await OAuthClient.findByPk(client_id, { raw: true })
      if (!client || (client_secret && client_secret !== client.client_secret)) {
        return false
      }

      if (client) { client.grants = ['authorization_code', 'password'] }

      return client
    },

    async getRefreshToken (refresh_token) {
      const oauth_token = await OAuthToken.findOne({ where: { refresh_token }, raw: true })
      return oauth_token
    },

    async getAuthorizationCode (code) {
      const oauth_code = await OAuthCode.findByPk(code,
        { include: [User, { model: OAuthClient, as: 'client' }] })
      return oauth_code
    },

    async saveToken (token, client, user) {
      token.userId = user.id
      token.clientId = client.id
      const oauth_token = await OAuthToken.create(token)
      oauth_token.client = client
      oauth_token.user = user
      return oauth_token
    },

    async revokeAuthorizationCode (code) {
      const oauth_code = await OAuthCode.findByPk(code.authorizationCode)
      return oauth_code.destroy()
    },

    async getUser (username, password) {
      const user = await User.findOne({ where: { email: username } })
      if (!user || !user.is_active) {
        return false
      }
      // check if password matches
      if (await user.comparePassword(password)) {
        return user
      }
      return false
    },

    async saveAuthorizationCode (code, client, user) {
      code.userId = user.id
      code.clientId = client.id
      code.expiresAt = dayjs(code.expiresAt).toDate()
      return OAuthCode.create(code)
    },

    // TODO
    verifyScope (token, scope) {
      // const userScope = [
      //   'user:remove',
      //   'user:update',
      //   'event:write',
      //   'event:remove'
      // ]
      log.debug(`VERIFY SCOPE ${scope} ${token.user.email}`)
      if (token.user.is_admin && token.user.is_active) {
        return true
      } else {
        return false
      }
    }

  }
}

module.exports = oauthController
