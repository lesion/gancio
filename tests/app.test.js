const request = require('supertest')

const admin = { username: 'admin', password: 'SsJOn5l0JpBE', grant_type: 'password', client_id: 'self' }
let token
// - event list should be empty
// - try to write without auth
// - registration should be not allowed when disabled
// - registration should create a new user (not active) when enabled
// - unconfirmed user cannot login
// - should not login without auth data
// - should login with correct authentication
let app
beforeAll( async () => {
  await require('../server/initialize.server.js')()
  app = require('../server/routes.js')
})

describe('Basic', () => {
  test('shoud return an empty list', async () => {
    const response = await request(app).get('/api/events')
      .expect(200)

    expect(response.body.length).toBe(0)
  })
})

describe('Authentication / Authorization', () => {
  test('should not return an user when not authenticated', () => {
    return request(app).get('/api/user')
      .expect(403)
  })

  test('should not authenticate with wrong user/password', () => {
    return request(app).post('/oauth/login')
      .expect(500)
  })

  test('should authenticate with correct user/password', async () => {
    const response = await request(app).post('/oauth/login')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(admin)
      .expect(200)
    expect(response.body.refresh_token).toBeDefined()
    expect(response.body.access_token).toBeDefined()
    expect(response.body.token_type).toBe('Bearer')
    token = response.body
  })
  
  test('should get user when authenticated', async () => {
    const response = await request(app).get('/api/user')
      .auth(token.access_token, { type: 'bearer' })
      .expect(200)
    expect(response.body.email).toBe(admin.username)
    expect(response.body.is_admin).toBe(true)
  })

  test('should not change settings when not allowed', async () => {
    let response
    response = await request(app).post('/api/settings')
      .send({ key: 'allow_anon_event', value: false })
      .expect(403)
  })

  // test('should create anon event only when allowed', async () => {
  //   let response
  //   response = await request(app)
  //   .post('/api/settings') // auth._token.local
  //   .send({ key: 'allow_anon_event', value: false })
  //   .auth(token.access_token, { type: 'bearer' })
  //     .expect(200)
  //   // expect(response.statusCode).toBe(200)
  //   // response = await request(app).post('/api/settings')
  //   //   .send({ key: 'allow_anon_event', value: false })
  // })

})

describe('Events', () => {


  test('should not allow event creation without required fields', async () => {
    const required_fields = {
      'title': {},
      'place_name': { title: 'test title' },
      'start_datetime': { title: 'test title', 'place_name': 'test place name'}
    }

    const promises = Object.keys(required_fields).map(async field => {
      const response = await request(app).post('/api/event').send(required_fields[field])
      expect(response.statusCode).toBe(400)
      expect(response.text).toBe(`${field} is required`)
      return
    })
    
    return Promise.all(promises)
  })
})
