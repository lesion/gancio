const Follows = require('./follows')
const Resources = require('./resources')
const Events = require('./events')
const Ego = require('./ego')
const log = require('../log')

module.exports = async (req, res) => {
  const message = req.body

  // has to have an object property..
  if (!message?.object) {
    log.warn('[FEDI] message without `object` property: %s', message)
    return res.status(404).send('User not found')
  }

  log.debug('[FEDI] %s', message.type)
  switch (message.type) {
    case 'Follow':
      Follows.follow(req, res)
      break
    case 'Undo':
      // unfollow || unlike || unboost
      if (message.object.type === 'Follow') {
        Follows.unfollow(req, res)
      } else if (message.object.type === 'Like') {
        Ego.unbookmark(req, res)
      } else if (message.object.type === 'Announce') {
        Ego.unboost(req, res)
      }
      break
    case 'Announce':
      Ego.boost(req, res)
      break
    case 'Note':
      log.debug('This is a note! I probably should create a comment here but where?')
      break
    case 'Like':
      Ego.bookmark(req, res)
      break
    case 'Delete':
      if (message.object.type === 'Note') {
        await Resources.remove(req, res)
      } else if (message.object.type === 'Event') {
        if (!res.locals.fedi_user.following || !res.locals.fedi_user.friendly) {
          log.warn(`APUser not followed or not friendly`)
          return res.sendStatus(404)
        }        
        await Events.remove(req, res)
      }
      break
    case 'Update':
      if (message.object.type === 'Event') {
        log.debug(`[FEDI] Event update is coming from ${res.locals.fedi_user.ap_id}`)
        if (!res.locals.fedi_user.following || !res.locals.fedi_user.friendly) {
          log.warn(`[FEDI] APUser not followed or not friendly`)
          return res.sendStatus(404)
        }
        await Events.update(req, res)
      }
    case 'Create':
      // this is a reply
      if (message.object.type === 'Note') {
        log.debug('Create a resource!')
        await Resources.create(req, res)
      } else if (message.object.type === 'Event') {
        log.debug(`[FEDI] Event is coming from ${res.locals.fedi_user.ap_id}`)
        if (!res.locals.fedi_user.following || !res.locals.fedi_user.friendly) {
          log.warn(`[FEDI] APUser not followed nor trusted`)
          return res.sendStatus(404)
        }        
        await Events.create(req, res)
      } else {
        // await Resources.create(req, res)
        log.warn(`Create with unsupported Object or not a reply => ${message.object.type}`)
      }
      break
  }
}
