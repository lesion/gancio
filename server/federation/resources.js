const { event: Event, resource: Resource, ap_user: APUser } = require('../api/models')
const debug = require('debug')('fediverse:resource')
const helpers = require('../helpers')

module.exports = {

  // create a resource from AP Note
  async create (req, res) {
    const body = req.body

    // search for related event
    let event

    // it's an answer
    const inReplyTo = body.object.inReplyTo

    if (inReplyTo) {
      // .. to an event ?
      const match = inReplyTo && inReplyTo.match('.*/federation/m/(.*)')
      debug('Event reply => ', inReplyTo)
      if (match) {
        event = await Event.findByPk(Number(match[1]))
      } else {
        // in reply to another resource...
        const resource = await Resource.findOne({ where: { activitypub_id: inReplyTo }, include: [Event] })
        event = resource && resource.event
      }
    }

    debug('resource from %s to "%s"', req.body.actor, event && event.title)

    // TODO should probably map links here
    // clean resource
    body.object.content = helpers.sanitizeHTML(body.object.content, {
      nonTextTags: ['style', 'script', 'textarea', 'noscript']
    })

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
      include: [{ model: APUser, required: false, attributes: ['ap_id'] }]
    })
    if (!resource) {
      debug('Comment %s not found', req.body.object.id)
      return res.status(404).send('Not found')
    }
    // check if fedi_user that requested resource removal
    // is the same that created the resource at first place
    debug(res.fedi_user.ap_id, resource.ap_user.ap_id)
    if (res.fedi_user.ap_id === resource.ap_user.id) {
      await resource.destroy()
      debug('Comment %s removed!', req.body.object.id)
      res.sendStatus(201)
    } else {
      res.sendStatus(403)
    }
  }
}
