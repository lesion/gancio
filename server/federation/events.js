const log = require('../log')
const helpers = require('../helpers')
const linkifyHtml = require('linkify-html')
const dayjs = require('dayjs')
const eventController = require('../api/controller/event')
const { Event, APUser, Resource } = require('../api/models/models')
const tagController = require('../api/controller/tag')

module.exports = {

  // create an Event from AP
  async create (req, res) {

    const APEvent = req.body?.object

    // validate coming events
    const required_fields = ['name', 'startTime']
    let missing_field = required_fields.find(required_field => !APEvent[required_field])
    if (missing_field) {
      log.warn(`[FEDI] ${missing_field} required`)
      return res.status(400).send(`${missing_field} required`)
    }

    // check if this event is new
    const ap_id = req.body.object.id
    const exists = await Event.findOne({ where: { ap_id }})
    if (exists) {
      log.warn('[FEDI] Avoid creating a duplicated event %s', ap_id)
      return res.sendStatus(404)
    }

    const place = await eventController._findOrCreatePlace({
      place_name: APEvent.location?.name,
      place_address: APEvent.location?.address,
    })

    let media = []
    if (APEvent?.attachment?.length > 0) {

      const image_url = APEvent.attachment[0]?.url
      req.file = await helpers.getImageFromURL(image_url)
      log.debug('[FEDI] Download attachment for event %s', image_url)

      media = [{
        url: req.file.filename,
        height: req.file.height,
        width: req.file.width,
        name: APEvent.attachment[0]?.name || APEvent.name.trim() || '',
        size: req.file.size || 0,
        focalpoint: APEvent.attachment[0]?.focalPoint
      }]
    }

    // create it
    const event = await Event.create({
      title: APEvent.name.trim(),
      start_datetime: dayjs(APEvent.startTime).unix(),
      end_datetime: APEvent?.endTime ? dayjs(APEvent.endTime).unix() : null,
      description: helpers.sanitizeHTML(linkifyHtml(APEvent.content)),
      media,
      is_visible: true,
      ap_id,
      ap_object: APEvent,
      apUserApId: req.body.actor,
    })

    await event.setPlace(place)

    // create/assign tags
    let tags = []
    if (APEvent.tag) {
      tags = await tagController._findOrCreate(APEvent.tag.map(t => t?.name.substr(1)))
      await event.setTags(tags)
    }

    return res.sendStatus(201)

  },

  // update an event from AP
  async update (req, res) {
    const APEvent = req.body?.object

    // check if this event is new
    const ap_id = APEvent?.id ?? APEvent

    if (!ap_id) {
      return res.sendStatus(404)
    }

    const event = await Event.findOne({ where: { ap_id }, include: [APUser]})
    if (!event) { return res.sendStatus(404)}

    // is the owner the same?
    if (res.locals.fedi_user.ap_id !== event?.ap_user?.ap_id) {
      log.error('[FEDI] Event %s updated not from the owner! %s != %s', ap_id, res.locales.fedi_user.ap_id, event)
    }

    const place = await eventController._findOrCreatePlace({
      place_name: APEvent.location?.name,
      place_address: APEvent.location?.address,
    })

    let media = []
    if (APEvent.attachment.length > 0) {

      const image_url = APEvent.attachment[0]?.url
      req.file = await helpers.getImageFromURL(image_url)

      media = [{
        url: req.file.filename,
        height: req.file.height,
        width: req.file.width,
        name: APEvent.attachment[0]?.name || APEvent.name.trim() || '',
        size: req.file.size || 0,
        focalpoint: APEvent.attachment[0]?.focalPoint
      }]
    }

    // create it
    event.update({
      title: APEvent.name.trim(),
      start_datetime: dayjs(APEvent.startTime).unix(),
      end_datetime: APEvent?.endTime ? dayjs(APEvent.endTime).unix() : null,
      description: helpers.sanitizeHTML(linkifyHtml(APEvent.content)),
      media,
      is_visible: true,
      ap_id,
      ap_object: APEvent,
      apUserApId: req.body.actor,
    })

    await event.setPlace(place)

    // create/assign tags
    let tags = []
    if (APEvent.tag) {
      tags = await tagController._findOrCreate(APEvent.tag.map(t => t?.name.substr(1)))
      await event.setTags(tags)
    }

    return res.sendStatus(201)

  },

  // remove an event from AP
  async remove (req, res) {
    const APEvent = req.body?.object
    const ap_id = APEvent?.id ?? APEvent

    if (!ap_id) {
      return res.sendStatus(404)
    }

    const event = await Event.findOne({ where: { ap_id }, include: [APUser]})
    if (!event) {
      log.error('[FEDI] Event not found: %s', APEvent?.id ?? APEvent)
      return res.sendStatus(404)
    }
    
    // is the owner the same?
    if (res.locals.fedi_user.ap_id !== event?.ap_user?.ap_id) {
      log.error('[FEDI] Event %s updated not from the owner! %s != %s', ap_id, res.locales.fedi_user.ap_id, event)
    }

    if (event.media && event.media.length && !event.recurrent) {
      try {
        const old_path = path.join(config.upload_path, event.media[0].url)
        const old_thumb_path = path.join(config.upload_path, 'thumb', event.media[0].url)
        await fs.unlink(old_thumb_path)
        await fs.unlink(old_path)
      } catch (e) {
        log.info(e.toString())
      }
    }

    if (event.recurrent) {
      await Event.update({ parentId: null }, { where: { parentId: event.id } })
    }

    log.debug('[EVENT REMOVED] ' + event.title)
    try {
      // remove related resources
      await Resource.destroy({ where: { eventId: event.id }})
      
      // and finally remove the event
      await event.destroy()
    } catch (e) {
      log.error('[FEDI] Error removing event: %s', String(e))
      return  res.sendStatus(500)
    }

    return res.sendStatus(201)

  }

}