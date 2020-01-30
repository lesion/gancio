const debug = require('debug')('TaskManager')
const eventController = require('./api/controller/event')
// const notifier = require('./notifier')

class Task {
  constructor ({ name, removable = false, repeatEach = 1, method, args = [] }) {
    this.name = name
    this.removable = removable
    this.repeatEach = repeatEach
    this.processInNTick = repeatEach
    this.method = method
    this.args = args
  }

  process () {
    debug('PROCESS ', this.name)
    this.processInNTick--
    if (this.processInNTick > 0) {
      return
    }
    this.processInNTick = this.repeatEach
    try {
      const ret = this.method.apply(this, this.args)
      if (ret && typeof ret.then === 'function') {
        ret.catch(e => debug('TASK ERROR ', this.name, e))
        return ret
      }
    } catch (e) {
      debug('TASK ERROR ', this.name, e)
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
 */

class TaskManager {
  constructor () {
    this.interval = 60 * 100
    this.tasks = []
  }

  start (interval = 60 * 100) {
    this.interval = interval
    this.timeout = setTimeout(this.tick.bind(this), interval)
  }

  stop () {
    if (this.timeout) {
      debug('STOP')
      clearTimeout(this.timeout)
      this.timeout = false
    }
  }

  add (task) {
    debug('ADD TASK ', task.name)
    this.tasks.push(task)
  }

  process () {
    if (!this.tasks.length) {
      return
    }
    const removableTasks = this.tasks.filter(t => t.removable).map(t => t.process())
    this.tasks = this.tasks.filter(t => !t.removable)
    const tasks = this.tasks.map(t => t.process())
    return Promise.all(tasks.concat(removableTasks))
  }

  async tick () {
    await this.process()
    this.timeout = setTimeout(this.tick.bind(this), this.interval)
  }
}

const TS = new TaskManager()

// create and clean recurrent events
TS.add(new Task({
  name: 'RECURRENT_EVENT',
  method: eventController._createRecurrent,
  repeatEach: 10
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

// TS.start()
// TS.add(new Task({ name: 'removable #1', method: daje, args: ['removable #1'], removable: true }))
// TS.add(new Task({ name: 'non removable #2', method: daje, args: ['non removable #2'] }))
// TS.add(new Task({ name: 'non removable and repeat each #2', method: daje, args: ['nn rm and rpt #5'], repeatEach: 5 }))

module.exports = { Task, TaskManager: TS }
