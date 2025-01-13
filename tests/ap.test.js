const request = require('supertest')
const dayjs = require('dayjs')
const path = require('path')

const admin = { username: 'admin', password: 'test', grant_type: 'password', client_id: 'self' }

let token
let app
let places = []

beforeAll(async () => {

  switch (process.env.DB) {
    case 'mariadb':
      process.env.config_path = path.resolve(__dirname, './seeds/config.mariadb.json')
      break
    case 'postgresql':
      process.env.config_path = path.resolve(__dirname, './seeds/config.postgres.json')
      break
    case 'sqlite':
    default:
      process.env.config_path = path.resolve(__dirname, './seeds/config.sqlite.json')
  }
  try {
    app = await require('../server/routes.js').main()
    const { sequelize } = require('../server/api/models/index')
    const { col } = require('../server/helpers')

    // sequelize.sync({ force: true })
    // await sequelize.query('PRAGMA foreign_keys = OFF')
    await sequelize.query('DELETE FROM settings')
    await sequelize.query(`DELETE FROM ${col('user_followers')}`)
    await sequelize.query(`DELETE FROM ${col('events')} where ${col('parentId')} IS NOT NULL`)
    await sequelize.query('DELETE FROM ap_users')
    await sequelize.query('DELETE FROM events')
    await sequelize.query('DELETE FROM event_tags')
    await sequelize.query('DELETE FROM resources')
    await sequelize.query('DELETE FROM instances')
    await sequelize.query('DELETE FROM announcements')
    await sequelize.query('DELETE FROM oauth_tokens')
    await sequelize.query('DELETE FROM users')
    await sequelize.query('DELETE FROM tags')
    await sequelize.query('DELETE FROM places')
    await sequelize.query('DELETE FROM filters')
    await sequelize.query('DELETE FROM collections')
    await sequelize.query('DELETE FROM notifications')
    await sequelize.query('DELETE FROM tasks')
    // await sequelize.query('PRAGMA foreign_keys = ON')
  } catch (e) {
    console.error(e)
  }
})

afterAll(async () => {
  await require('../server/initialize.server.js').shutdown(false)
})

describe('Nodeinfo', () => {
  test('shoud return a json content', async () => {
    const response = await request(app).get('/.well-known/nodeinfo')
      .expect('Content-Type', /application\/json/)
      .expect(200)
  })

  test('shoud support nodeinfo 2.0 and 2.1', async () => {
    const response = await request(app).get('/.well-known/nodeinfo')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      expect(response.body.links.find(l => l.rel === 'http://nodeinfo.diaspora.software/ns/schema/2.0').href).toBe('http://localhost:13120/.well-known/nodeinfo/2.0')
      expect(response.body.links.find(l => l.rel === 'http://nodeinfo.diaspora.software/ns/schema/2.1').href).toBe('http://localhost:13120/.well-known/nodeinfo/2.1')
  })

  test('shoud implement FEP-2677 - Application Actor', async () => {
    const response = await request(app).get('/.well-known/nodeinfo')
      .expect('Content-Type', /application\/json/)
      .expect(200)
      expect(response.body.links.find(l => l.rel === 'https://www.w3.org/ns/activitystreams#Application').href).toBe('http://localhost:13120/federation/u/relay')
  })
})

describe('Webfinger', () => {
  test('should return a 404 on bad request', () => {
    request(app).get('/.well-known/webfinger')
      .expect(400)
  })

  test('should return webfinger response', async () => {
    const response = await request(app).get('/.well-known/webfinger?resource=acct:relay@localhost:13120')
      .expect(200)
      .expect('Content-Type', 'application/jrd+json; charset=utf-8')
    
    expect(response.body.subject).toBe('acct:relay@localhost:13120')
  })
})

describe('AP', () => {
  test('should return the AP Actor', async () => {
    const response = await request(app).get('/federation/u/relay')
      .expect(200)
      .expect('Content-Type', /json/)

    expect(response.body.type).toBe('Application')
  })


  describe('Location', () => {

    test('should fail parsing a location without a name', async () => {
      const { parsePlace } = require('../server/federation/helpers.js')
      const location = require('./fixtures/AP-location/bad-location-without-a-name.json')
      expect(parsePlace({ location })).rejects.toThrow()
    })

    test ('should parse a location with only a name', async () => {
      const { parsePlace } = require('../server/federation/helpers.js')
      const location = require('./fixtures/AP-location/physical-location-without-id.json')
      let [place] = await parsePlace({ location })
      expect(place.name).toBe('Location without id')
      expect(place.ap_id).toBeUndefined()
      expect(place.id).toBe(1)
    })

    test ('should parse a location with id and name', async () => {
      const { parsePlace } = require('../server/federation/helpers.js')
      const location = require('./fixtures/AP-location/physical-location-no-address.json')
      let [place] = await parsePlace({ location })
      expect(place.name).toBe('Location with a name')
      expect(place.address).toBe('Location with a name')
      expect(place.id).toBe(2)
    })

    test ('should parse a location with a simple string address', async () => {
      const { parsePlace } = require('../server/federation/helpers.js')
      const location = require('./fixtures/AP-location/physical-location-with-simple-string-address.json')
      let [place] = await parsePlace({ location })
      expect(place.name).toBe('Location with a simple string address')
    })

    test ('should parse a location with a postal address', async () => {
      const { parsePlace } = require('../server/federation/helpers.js')
      const location = require('./fixtures/AP-location/physical-location-with-postal-address.json')
      let [place] = await parsePlace({ location })
      expect(place.name).toBe('Location with a postal address')
    })

    test ('should parse a virtual location', async () => {
      const { parsePlace } = require('../server/federation/helpers.js')
      const location = require('./fixtures/AP-location/virtual-location.json')
      let [place, online_locations] = await parsePlace({ location })
      expect(place.name).toBe('online')
      expect(online_locations.length).toBe(1)
      expect(online_locations[0]).toBe("https://virtual.location.org")
    })

    test ('should parse a mixed location', async () => {
      const { parsePlace } = require('../server/federation/helpers.js')
      const location = require('./fixtures/AP-location/multiple-mixed-locations.json')
      let [place, online_locations] = await parsePlace({ location })
      expect(place.name).toBe('Location with a name')
      expect(online_locations.length).toBe(2)
      expect(online_locations[0]).toBe('https://virtual.location.org')
    })
  })

  // test('should not allow to create a new Event from a random instance', async () => {
  //   const response = await request(app)
  //     .post('/federation/u/relay/inbox')
  //     .send({
  //       actor: 'http://localhost:13120/federation/u/relay'
  //     })
  //     .expect(401)

  //   console.error(response)
  // })
})