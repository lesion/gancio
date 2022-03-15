const request = require('supertest')
const fs = require('fs')

const admin = { username: 'admin', password: 'JqFuXEnkTyOR', grant_type: 'password', client_id: 'self' }
let token
let app

beforeAll( async () => {
  fs.copyFileSync('./starter.sqlite', './testdb.sqlite')
  await require('../server/initialize.server.js')()
  app = require('../server/routes.js')
})

describe('Basic', () => {
  test('shoud not return sites if not authenticated', async () => {
    await request(app).get('/api/sites')
      .expect(403)
  })
})

describe('Authentication / Authorization', () => {

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

  test('should not get user when authenticated with other host', async () => {
    const response = await request(app).get('/api/user')
      .set('Host', 'cisti.org')
      .auth(token.access_token, { type: 'bearer' })
      .expect(403)
    expect(response.body.email).toBe(admin.username)
    expect(response.body.is_admin).toBe(true)
  })


  test('shoud return sites if authenticated', async () => {
    const response = await request(app).get('/api/sites')
      .auth(token.access_token, { type: 'bearer' })
      .expect(200)

    expect(response.body.length).toBe(1)
  })

  test('should create anon event only when allowed', async () => {
    let response
    response = await request(app).post('/api/settings')
    .send({ key: 'allow_anon_event', value: false })
    .auth(token.access_token, { type: 'bearer' })
      .expect(200)
    
    response = await request(app).post('/api/event')
      .expect(403)

    response = await request(app).post('/api/settings')
      .send({ key: 'allow_anon_event', value: true })
      .auth(token.access_token, { type: 'bearer' })
        .expect(200)
  
    response = await request(app).post('/api/event')
      .send({ title: 'test title', place_name: 'place name', start_datetime: new Date().getTime() * 1000 })
      .expect(200)
        
    // expect(response.statusCode).toBe(200)
    // response = await request(app).post('/api/settings')
    //   .send({ key: 'allow_anon_event', value: false })
  })

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
        .expect(400)
      expect(response.text).toBe(`${field} is required`)
      return
    })
    
    return Promise.all(promises)
  })
})
