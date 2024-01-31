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
    await sequelize.query('DELETE FROM event_notifications')
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