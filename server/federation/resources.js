const Event = require('../api/models/event')
const Resource = require('../api/models/resource')
const APUser = require('../api/models/ap_user')
const settingsController = require('../api/controller/settings')

const log = require('../log')
const helpers = require('../helpers')
const linkifyHtml = require('linkify-html')

module.exports = {

  // create a resource from AP Note
  async create (req, res) {
    if (!settingsController.settings.enable_resources) {
      log.info('Ignore resource as it is disabled in settings')
      return
    }

    const body = req.body

    // search for related event
    let event

    // it's an answer
    const inReplyTo = body.object.inReplyTo

    if (inReplyTo) {
      // .. to an event ?
      const match = inReplyTo && inReplyTo.match('.*/federation/m/(.*)')
      log.info(`Event reply => ${inReplyTo}`)
      if (match) {
        event = await Event.findByPk(Number(match[1]))
      } else {
        // in reply to another resource...
        const resource = await Resource.findOne({ where: { activitypub_id: inReplyTo }, include: [Event] })
        event = resource && resource.event
      }
    }

    if (!event) {
      log.error('This is a direct message. Just ignore it')
      log.error(body)
      return res.status(404).send('Not found')
    }

    log.debug(`resource from ${req.body.actor} to "${event.title}"`)

    body.object.content = helpers.sanitizeHTML(linkifyHtml(body.object.content))

    await Resource.create({
      activitypub_id: body.object.id,
      apUserApId: req.body.actor,
      data: body.object,
      eventId: event && event.id
    })

    res.sendStatus(201)
  },

  async remove (req, res) {
    const resource = await Resource.findOne({
      where: { activitypub_id: req.body.object.id },
      include: [{ model: APUser, required: true, attributes: ['ap_id'] }]
    })
    if (!resource) {
      log.info(`Comment ${req.body.object.id} not found`)
      return res.status(404).send('Not found')
    }
    // check if fedi_user that requested resource removal
    // is the same that created the resource at first place
    if (res.locals.fedi_user.ap_id === resource.ap_user.ap_id) {
      await resource.destroy()
      log.info(`Comment ${req.body.object.id} removed`)
      res.sendStatus(201)
    } else {
      res.sendStatus(403)
    }
  }
}
