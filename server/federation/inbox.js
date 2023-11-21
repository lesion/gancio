const Follows = require('./follows')
const Resources = require('./resources')
const Events = require('./events')
const Ego = require('./ego')
const log = require('../log')

module.exports = async (req, res) => {
  const b = req.body
  log.debug(b.type)
  switch (b.type) {
    case 'Follow':
      Follows.follow(req, res)
      break
    case 'Undo':
      // unfollow || unlike || unboost
      if (b.object.type === 'Follow') {
        Follows.unfollow(req, res)
      } else if (b.object.type === 'Like') {
        Ego.unbookmark(req, res)
      } else if (b.object.type === 'Announce') {
        Ego.unboost(req, res)
      }
      break
    case 'Announce':
      Ego.boost(req, res)
      break
    case 'Note':
      log.debug('This is a note! I probably should create a comment here')
      break
    case 'Like':
      Ego.bookmark(req, res)
      break
    case 'Delete':
      if (b.object.type === 'Note') {
        await Resources.remove(req, res)
      } else if (b.object.type === 'Event') {
        await Events.remove(req, res)
      }
      break
    case 'Update':
      if (b.object.type === 'Event') {
        log.debug(`Event update is coming from ${res.locals.fedi_user}`)
        await Event.update(req, res)
      }
    case 'Create':
      // this is a reply
      if (b.object.type === 'Note') {
        log.debug('Create a resource!')
        await Resources.create(req, res)
      } else if (b.object.type === 'Event') {
        log.debug(`Event is coming from ${res.locals.fedi_user.ap_id}`)
        await Events.create(req, res)
      } else {
        // await Resources.create(req, res)
        log.warn(`Create with unsupported Object or not a reply => ${b.object.type}`)
      }
      break
  }
}
