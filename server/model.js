const crypto = require('crypto')
const { promisify } = require('util')
const randomBytes = promisify(crypto.randomBytes)

async function randomString(len = 16) {
  const bytes = await randomBytes(len*8)
  return crypto
    .createHash('sha1')
    .update(bytes)
    .digest('hex')
}

const OAuth = {
  clients: [
    { clientId : 'confidentialApplication', clientSecret : 'topSecret',
      redirectUris : ['https://localhost:13120/asdf', 'https://example-app.com/callback', 'https://oauthdebugger.com/debug'],
      grants: ['password', 'authorization_code', 'client_credentials']
    },
    { 
      clientId: '1766891b7fb5fda4235dc7f0dde70fcd783371c2', clientSecret: 'ed6fdc050a415f178f2ac8428b76734edef75e5c',
      grants: ['authorization_code'], redirectUris: ['urn:ietf:wg:oauth:2.0:oob'], scopes: ['write'], state: 'a'
    }
  ],
  tokens: [],
  users: [{ id : '123', username: 'thomseddon', password: 'nightworld' }],

  getAccessToken (bearerToken) {
    console.error('dentro get access token', bearerToken, OAuth.tokens)
    const tokens = OAuth.tokens.filter(token => token.accessToken === bearerToken)
    return tokens.length ? tokens[0] : false
  },
  verifyScope (accessToken, scope) {
    console.error('dentro verify scope', scope)
  },
  getRefreshToken (bearerToken) {
    console.error('dentro refresh token')
    const tokens = OAuth.tokens.filter( token => token.refreshToken === bearerToken )
    return tokens.length ? tokens[0] : false
  },
  getClientCredentials () {
    console.error('dentro get client credentials')
  },
  getClient (clientId, clientSecret) {
    console.error(`getClient ${clientId} / ${clientSecret}`)
    const clients = OAuth.clients.filter( client => client.clientId === clientId)
    console.error(clients)
    return clients.length ? clients[0] : false
  },
  getAuthorizationCode(authorizationCode) {
    console.error('get auth code')
  },
  revokeAuthorizationCode (code) {
    console.error('dentro revoke auth code ', code)
  },
  async createClient (client) {
    client.client_id = await randomString(256)
    client.client_secret = await randomString(256)
    OAuth.clients.push(client)
    return client
  },
  saveAuthorizationCode(code, client, user) {
    console.error('dentro save auth code')
    const ret = {
      ...code,
      user,
      client
    }
    OAuth.tokens.push(ret)
    console.error('DIOCANEEEE salvo auth code!', OAuth.tokens)
    return ret
  },
  saveToken (token) {
    console.error('dentro save token')
  },
  // saveAuthorizationCode (token, client, user) {
  //   console.error('dentro save auth code')
  //   return true
  // },
  getUser (username, password) {
    console.error('dentro get user')
  }
}

module.exports = OAuth
