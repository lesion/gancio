const log = require('./log')
const eventController = require('./api/controller/event')
const placeHelpers = require('./helpers/place')
const tagHelpers = require('./helpers/tag')
// const notifier = require('./notifier')

const loopInterval = 1 // process.env.NODE_ENV === 'production' ? 1 : 1
const minute = 60 / loopInterval
const hour = minute * 60
const day = hour * 24

class Task {
  constructor ({ name, repeat = false, repeatDelay = 1, callAtStart = false, method, args = [] }) {
    this.name = name
    this.repeat = repeat
    this.repeatDelay = repeatDelay
    this.processInNTick = callAtStart ? 0 : repeatDelay
    this.method = method
    this.args = args
  }

  process () {
    this.processInNTick--
    if (this.processInNTick > 0) {
      return
    }
    this.processInNTick = this.repeatDelay
    try {
      const ret = this.method.apply(this, this.args)
      if (ret && typeof ret.then === 'function') {
        ret.catch(e => log.error('TASK ERROR [%s]: %s', this.name, e))
        return ret
      }
    } catch (e) {
      log.error('TASK ERROR [%s]: %s ', this.name, e)
      return Promise.resolve(false)
    }
  }
}

/**
 * Manage tasks:
 * - Send emails
 * - Send AP notifications
 * - Create recurrent events
 * - Sync AP federation profiles
 * - Remove unused tags/places
 */

class TaskManager {
  constructor () {
    this.tasks = []
    this.interval = 1
    this.timeout = null
  }

  start (interval = loopInterval) {
    log.info(`START TASK MANAGER WITH LOOP INTERVAL OF ${interval} seconds`)
    this.interval = interval
    this.timeout = setTimeout(this.tick.bind(this), interval * 1000)
  }

  stop () {
    if (this.timeout) {
      log.info('STOP TASKMANAGER')
      clearTimeout(this.timeout)
      this.timeout = false
    }
  }

  add (task) {
    log.info(`[TASK] Add ${task.name} (${task.repeatDelay * this.interval} seconds)`)
    this.tasks.push(task)
  }

  process () {
    if (!this.tasks.length) {
      return
    }

    // process all tasks
    const tasks = this.tasks.map(t => t.process())

    // remove removable tasks
    this.tasks = this.tasks.filter(t => t.repeat)

    return Promise.all(tasks)
  }

  async tick () {
    await this.process()
    this.timeout = setTimeout(this.tick.bind(this), this.interval * 1000)
  }
}

const TS = new TaskManager()

// create and clean recurrent events
TS.add(new Task({
  name: 'CREATE_RECURRENT_EVENT',
  method: eventController._createRecurrent,
  repeatDelay: hour / 2, // check each half an hour
  repeat: true
}))

// remove unrelated places
TS.add(new Task({
  name: 'CLEAN_UNUSED_PLACES',
  method: placeHelpers._cleanUnused,
  repeatDelay: day,
  repeat: true,
  callAtStart: true
}))

TS.add(new Task({
  name: 'CLEAN_UNUSED_TAGS',
  method: tagHelpers._cleanUnused,
  repeatDelay: day,
  repeat: true,
  callAtStart: true
}))

// daily morning notification
// TS.add(new Task({
//   name: 'NOTIFICATION',
//   method: notifier._daily,
//   repeatEach: 1
// }))

// AP users profile sync
// TaskManager.add(new Task({
//   name: 'AP_PROFILE_SYNC',
//   method: federation._sync,
//   repeatEach: 60 * 24
// }))

// Search for places position via nominatim
// TaskManager.add(new Task({
//   name: 'NOMINATIM_QUERY',
//   method: places._nominatimQuery,
//   repeatEach: 60
// }))
//

// TS.start()
// TS.add(new Task({ name: 'removable #1', method: daje, args: ['removable #1'], removable: true }))
// TS.add(new Task({ name: 'non removable #2', method: daje, args: ['non removable #2'] }))
// TS.add(new Task({ name: 'non removable and repeat each #2', method: daje, args: ['nn rm and rpt #5'], repeatEach: 5 }))

module.exports = { Task, TaskManager: TS }
