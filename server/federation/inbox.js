const Follows = require('./follows')
const Resources = require('./resources')
const Events = require('./events')
const Ego = require('./ego')
const log = require('../log')

module.exports = async (req, res) => {
  const message = req.body

  // has to have an object and a type property..
  if (!message?.object || !message?.type) {
    log.warn('[FEDI] message without `object` or `type` property: %s', message)
    return res.status(404).send('Wrong AP message: no object or type property')
  }

  log.debug('[FEDI] Type %s', message.type)
  switch (message.type) {
    case 'Follow':
      Follows.follow(req, res)
      break
    case 'Accept':
      return res.sendStatus(202)
    case 'Undo':
      // unfollow || unlike || unboost
      if (message.object?.type === 'Follow') {
        Follows.unfollow(req, res)
      } else if (message.object?.type === 'Like') {
        Ego.unbookmark(req, res)
      } else if (message.object?.type === 'Announce') {
        Ego.unboost(req, res)
      } else {
        log.warn('[FEDI] Undo message type with unsupported object: %s', JSON.stringify(message.object))
      }
      break
    case 'Announce':
      Ego.boost(req, res)
      break
    case 'Note':
      log.debug('[FEDI] This is a note and it is not supported: %s', JSON.stringify(message.object))
      break
    case 'Like':
      Ego.bookmark(req, res)
      break
    case 'Delete':
      if (['Note','Tombstone'].includes(message.object?.type)) {
        await Resources.remove(req, res)
      } else if (message.object?.type === 'Event') {
        if (!res.locals.fedi_user.following || !res.locals.fedi_user.trusted) {
          log.warn(`[FEDI] APUser not followed or not trusted`)
          return res.sendStatus(404)
        }        
        await Events.remove(req, res)
      }
      break
    case 'Update':
      if (message.object?.type === 'Event') {
        log.debug(`[FEDI] Event update is coming from ${res.locals.fedi_user.ap_id}`)
        if (!res.locals.fedi_user.following || !res.locals.fedi_user.trusted) {
          log.warn(`[FEDI] APUser not followed or not trusted`)
          return res.sendStatus(404)
        }
        await Events.update(req, res)
      } else if (message.object?.type === 'Note') {
        log.debug('[FEDI] Note update is coming from %s', res.locals.fedi_user.ap_id)
        await Resources.update(req, res)
      } else {
        log.debug('[FEDI] Unsupported Update: %s', JSON.stringify(message?.object))
      }
      break
    case 'Create':
      // this is a reply
      if (message.object?.type === 'Note') {
        await Resources.create(req, res)
      } else if (message.object?.type === 'Event') {
        log.debug(`[FEDI] Event is coming from ${res.locals.fedi_user.ap_id}`)
        if (!res.locals.fedi_user.following || !res.locals.fedi_user.trusted) {
          log.warn(`[FEDI] APUser not followed nor trusted`)
          return res.sendStatus(404)
        }        
        await Events.create(req, res)
      } else {
        // await Resources.create(req, res)
        log.warn('[FEDI] Create with unsupported Object or not a reply => %s', JSON.stringify(message?.object))
        return res.sendStatus(404)
      }
      break
    default:
      log.error('[FEDI] Unknown message type: %s', message?.type)
      res.sendStatus(404)
  }
}
