const path = require('path')
const { DateTime } = require('luxon')

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

describe('Recurrent events', () => {
  test('shoud create an occurrence in future when start date time is in past', async () => {
    const eventController = require('../server/api/controller/event')
    const { Event } = require('../server/api/models/models')

    // each week starting from past
    let ret = await Event.create({
      title: 'each week starting from past',
      is_visible: true,
      recurrent: { frequency: '1w' },
      start_datetime: DateTime.local(2023, 3, 27, 8).toUnixInteger(),
    })

    // 27 March 2023 08:00 -> 1w
    let ev = await eventController._createRecurrentOccurrence(ret)
    expect(ev.start_datetime).toBeGreaterThan(DateTime.local().toUnixInteger())
    expect(DateTime.fromSeconds(ev.start_datetime).hour).toBe(8)

    // 3 April 2023 08:00 -> 1w -> 10 April 2023 08:00
    // ev = await eventController._createRecurrentOccurrence(ret, DateTime.fromSeconds(ev.start_datetime+1), false)
    // expect(ev.start_datetime).

    // weekly test
    // data di inizio prima di oggi
    // data di inizio dopo di oggi
    // test creazione evento successivo (quando quello prima e' skipped)

    // stessa cosa per il bisettimanale

    // stessa cosa per il mensile (primo, secondo, ultimo mercoldi' del mese)

    // stessa cosa per il mensile ordinal (il 4 di ogni mese)


  })

  test('shoud create an occurrence when start date time is in future', async () => {
    const eventController = require('../server/api/controller/event')
    const { Event } = require('../server/api/models/models')

    // each week starting from future
    ret = await Event.create({
      title: 'each week starting from future',
      is_visible: true,
      recurrent: { frequency: '1w' },
      start_datetime: DateTime.local(2033, 3, 27, 8).toUnixInteger(),
    })

    // 27 March 2033 08:00 -> 1w -> 27 March 2033 08:00
    ev = await eventController._createRecurrentOccurrence(ret)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 3, 27, 8).toUnixInteger())

    // 27 March 2033 08:00 -> 1w -> 3 April 2023 08:00
    ev = await eventController._createRecurrentOccurrence(ret,DateTime.fromSeconds(ev.start_datetime+1), false)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 4, 3, 8).toUnixInteger())

  })

  test('shoud create a 2 week occurrence in future when start date time is in future', async () => {
    const eventController = require('../server/api/controller/event')
    const { Event } = require('../server/api/models/models')

    // each week starting from past
    let ret = await Event.create({
      title: 'each 2 weeks starting from future',
      is_visible: true,
      recurrent: { frequency: '2w' },
      start_datetime: DateTime.local(2033, 3, 27, 8).toUnixInteger(),
    })

    // 27 March 2023 08:00 -> 2w -> 10 April 2023 08:00
    let ev = await eventController._createRecurrentOccurrence(ret)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 3, 27, 8).toUnixInteger())

    // 27 March 2033 08:00 -> 2w -> 10 April 2033 08:00
    ev = await eventController._createRecurrentOccurrence(ret, DateTime.fromSeconds(ev.start_datetime+1), false)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 4, 10, 8).toUnixInteger())
  })


  test('shoud create an occurrence each month in future when start date time is in past', async () => {
    const eventController = require('../server/api/controller/event')
    const { Event } = require('../server/api/models/models')

    // each week starting from past
    let ret = await Event.create({
      title: 'each month starting from future',
      is_visible: true,
      recurrent: { frequency: '1m', type: 'ordinal' },
      start_datetime: DateTime.local(2033, 3, 27, 8).toUnixInteger(),
    })

    // 27 March 2023 08:00 -> 2w -> 27 March 2023 08:00
    let ev = await eventController._createRecurrentOccurrence(ret)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 3, 27, 8).toUnixInteger())

    // 27 March 2033 08:00 -> 1m -> 27 April 2033 08:00
    ev = await eventController._createRecurrentOccurrence(ret, DateTime.fromSeconds(ev.start_datetime+1), false)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 4, 27, 8).toUnixInteger())
  })


  test('shoud create an occurrence each last monday', async () => {
    const eventController = require('../server/api/controller/event')
    const { Event } = require('../server/api/models/models')

    // each week
    let ret = await Event.create({
      title: 'each last monday starting',
      is_visible: true,
      recurrent: { frequency: '1m', type: -1 },
      start_datetime: DateTime.local(2033, 3, 27, 8).toUnixInteger(),
    })

    ev = await eventController._createRecurrentOccurrence(ret)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 3, 27, 8).toUnixInteger())


    // 27 March 2033 08:00 -> 1m -> 24 April 2033 08:00
    ev = await eventController._createRecurrentOccurrence(ret, DateTime.fromSeconds(ev.start_datetime+1), false)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 4, 24, 8).toUnixInteger())

    // 24 April 2033 08:00 -> 1m -> 29 May 2033 08:00
    ev = await eventController._createRecurrentOccurrence(ret, DateTime.fromSeconds(ev.start_datetime+1), false)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 5, 29, 8).toUnixInteger())

  })


  test('shoud create an occurrence each second tuesday', async () => {
    const eventController = require('../server/api/controller/event')
    const { Event } = require('../server/api/models/models')

    // each week starting from past
    let ret = await Event.create({
      title: 'each second tuesday',
      is_visible: true,
      recurrent: { frequency: '1m', type: 2 },
      start_datetime: DateTime.local(2033, 2, 8, 8).toUnixInteger(),
    })

    ev = await eventController._createRecurrentOccurrence(ret)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 2, 8, 8).toUnixInteger())

    ev = await eventController._createRecurrentOccurrence(ret, DateTime.fromSeconds(ev.start_datetime+1), false)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 3, 8, 8).toUnixInteger())

    // 8 March 2033 08:00 -> 1m -> 12 April 2033 08:00
    ev = await eventController._createRecurrentOccurrence(ret, DateTime.fromSeconds(ev.start_datetime+1), false)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 4, 12, 8).toUnixInteger())

    // 12 Apr 2033 08:00 -> 1m -> 10 May 2033 08:00
    ev = await eventController._createRecurrentOccurrence(ret, DateTime.fromSeconds(ev.start_datetime+1), false)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 5, 10, 8).toUnixInteger())


    // 10 May 2033 08:00 -> 1m -> 9 June 2033 08:00
    ev = await eventController._createRecurrentOccurrence(ret, DateTime.fromSeconds(ev.start_datetime+1), false)
    expect(ev.start_datetime).toBe(DateTime.local(2033, 6, 14, 8).toUnixInteger())

  })

})
