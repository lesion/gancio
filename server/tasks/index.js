const Queue = require('better-queue')
const debug = require('debug')('tasks')

/**
 * - send email (registration, password recovery, email notification, event confirmation)
 * - Create recurrent events
 * - Sync AP federation profiles?
 * - invio AP message
 * - scan OSM place coords
 * - backup db and create static version..
 */

const options = {
  maxRetries: 10,
  retryDelay: 1000 * 60,
  maxTimeout: 10000,
  afterProcessDelay: 10000
}

module.exports = new Queue((task, cb) => {
  debug('process a task ', task)
  cb()
}, options)
