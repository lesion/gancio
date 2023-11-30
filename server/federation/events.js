const log = require('../log')
const helpers = require('../helpers')
const linkifyHtml = require('linkify-html')
const dayjs = require('dayjs')
const eventController = require('../api/controller/event')
const { Event, APUser } = require('../api/models/models')
const tagController = require('../api/controller/tag')

module.exports = {

  // create an Event from AP
  async create (req, res) {

    const APEvent = req.body?.object

    // check if this event is new
    const ap_id = req.body.id
    const exists = await Event.findOne({ where: { ap_id }})
    if (exists) { return res.sendStatus(404)}

    const place = await eventController._findOrCreatePlace({
      place_name: APEvent.location?.name,
      place_address: APEvent.location?.address,
    })

    let media = []
    if (APEvent.attachment.length > 0) {

      const image_url = APEvent.attachment[0]?.url
      req.file = await helpers.getImageFromURL(image_url)

      // let focalpoint = body.image_focalpoint ? body.image_focalpoint.split(',') : ['0', '0']
      // focalpoint = [parseFloat(parseFloat(focalpoint[0]).toFixed(2)), parseFloat(parseFloat(focalpoint[1]).toFixed(2))]
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
      end_datetime: dayjs(APEvent.endTime).unix(),
      description: helpers.sanitizeHTML(linkifyHtml(APEvent.content)),
      media,
      is_visible: true,
      ap_id,
      apUserApId: req.body.actor,
    })

    await event.setPlace(place)

    // create/assign tags
    let tags = []
    if (APEvent.tag) {
      tags = await tagController._findOrCreate(APEvent.tag.map(t => t?.name.substr(1)))
      await event.setTags(tags)
    }

    return event

  },

  // update an event from AP
  async update (req, res) {
    const APEvent = req.body?.object

    // check if this event is new
    const ap_id = req.body.id
    const event = await Event.findOne({ where: { ap_id }})
    if (!event) { return res.sendStatus(404)}

    // TODO: is the owner the same?


    const place = await eventController._findOrCreatePlace({
      place_name: APEvent.location?.name,
      place_address: APEvent.location?.address,
    })

    let media = []
    if (APEvent.attachment.length > 0) {

      const image_url = APEvent.attachment[0]?.url
      req.file = await helpers.getImageFromURL(image_url)

      // let focalpoint = body.image_focalpoint ? body.image_focalpoint.split(',') : ['0', '0']
      // focalpoint = [parseFloat(parseFloat(focalpoint[0]).toFixed(2)), parseFloat(parseFloat(focalpoint[1]).toFixed(2))]
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
      end_datetime: dayjs(APEvent.endTime).unix(),
      description: helpers.sanitizeHTML(linkifyHtml(APEvent.content)),
      media,
      is_visible: true,
      ap_id,
      apUserApId: req.body.actor,
    })

    await event.setPlace(place)

    // create/assign tags
    let tags = []
    if (APEvent.tag) {
      tags = await tagController._findOrCreate(APEvent.tag.map(t => t?.name.substr(1)))
      await event.setTags(tags)
    }

    return event

  },

  // remove an event from AP
  async remove (req, res) {
    const APEvent = req.body?.object

    // check if we are following this user
    console.error(req.body)

    //
    console.error(APEvent)

  }

}