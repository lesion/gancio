const Follows = require('./follows')
const Resources = require('./resources')
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
      await Resources.remove(req, res)
      break
    case 'Create':
      // this is a reply
      if (b.object.type === 'Note') {
        log.debug('Create a resource!')
        await Resources.create(req, res)
      } else if (b.object.type === 'Event') {
        log.debug('Event type is coming!!')
      } else {
        // await Resources.create(req, res)
        log.warn(`Create with unsupported Object or not a reply => ${b.object.type}`)
      }
      break
  }
}
