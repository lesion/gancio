const crypto = require('crypto')
const { promisify } = require('util')
const randomBytes = promisify(crypto.randomBytes)
const {
  oauth_client: OAuthClient, oauth_token: OAuthToken,
  oauth_code: OAuthCode, user: User
} = require('../models')
const debug = require('debug')('oauth')

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
    debug('Create client ', req.body.client_name)
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
      debug(e)
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
  },

  model: {

    /**
     * Invoked to retrieve an existing access token previously saved through #saveToken().
     * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#getaccesstoken-accesstoken-callback
     * */
    async getAccessToken (accessToken) {
      const oauth_token = await OAuthToken.findByPk(accessToken,
        { include: [User, { model: OAuthClient, as: 'client' }], nest: true, raw: true })
      return oauth_token
    },

    /**
     * Invoked to retrieve a client using a client id or a client id/client secret combination, depending on the grant type.
     */
    async getClient (client_id, client_secret) {
      const client = await OAuthClient.findByPk(client_id, { raw: true })
      if (client_secret && client_secret !== client.client_secret) {
        return false
      }

      if (client) { client.grants = ['authorization_code'] }

      return client
    },

    async getRefreshToken (refresh_token) {
      const oauth_token = await OAuthToken.findOne({ where: { refresh_token }, raw: true })
      return oauth_token
    },

    async getAuthorizationCode (code) {
      const oauth_code = await OAuthCode.findByPk(code,
        { include: [User, { type: OAuthClient, as: 'client' }], nest: true, raw: true })
      return oauth_code
    },

    async saveToken (token, client, user) {
      token.userId = user.id
      token.oauthClientId = client.id
      const oauth_token = await OAuthToken.create(token)
      oauth_token.client = client
      oauth_token.user = user
      return oauth_token
    },

    async revokeAuthorizationCode (code) {
      const oauth_code = await OAuthCode.findByPk(code)
      return oauth_code.destroy()
    },

    async saveAuthorizationCode (code, client, user) {
      code.userId = user.id
      code.oauthClientId = client.id
      const ret = await OAuthCode.create(code)
      return ret
    }

  }
}

module.exports = oauthController
