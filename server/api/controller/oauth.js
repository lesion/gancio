const crypto = require('crypto')
const { promisify } = require('util')
const randomBytes = promisify(crypto.randomBytes)
const { oauth_client: OAuthClient, oauth_token: OAuthToken, 
  oauth_code: OAuthCode } = require('../models')

async function randomString(len = 16) {
  const bytes = await randomBytes(len*8)
  return crypto
    .createHash('sha1')
    .update(bytes)
    .digest('hex')
}


const oauthController = {

  async getClient (req, res) {
    const client_id = req.params.client_id
    const client = await OAuthClient.findOne({ where: { client_id }})
    console.error('ma non ho trovato il client ', client_id, client )
    res.json(client)
  },

  async createClient (req, res) {

    const client = {
      name: req.body.client_name,
      redirectUris: req.body.redirect_uris || 'urn:ietf:wg:oauth:2.0:oob',
      scopes: req.body.scopes || 'write',
      client_id: await randomString(256),
      client_secret: await randomString(256)
    }
    res.json(await OAuthClient.create(client))
  },

  async associate (req, res) {
    const { client_id, redirect_uri, response_type } = req.query
    console.error('dentro associate ', client_id, redirect_uri, response_type )
  },

  model: {
    async getClient (clientId, clientSecret) {
      console.error(`model getClient ${clientId} / ${clientSecret}`)
      const client = await OAuthClient.findByPk(clientId)
      client.grants = ['authorization_code']
      return client || false      
    },

    async saveAuthorizationCode(code, client, user) {
      console.error('dentro save auth code ', client, user, code)
      const ret = await OAuthCode.create(code)
      return ret    
    }
  }
}

module.exports = oauthController
