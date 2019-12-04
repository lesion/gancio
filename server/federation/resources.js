const { event: Event, resource: Resource } = require('../api/models')
const debug = require('debug')('fediverse:resource')
const sanitize = require('sanitize-html')
module.exports = {

  async create (req, res) {
    const body = req.body

    // search for related event
    const inReplyTo = body.object.inReplyTo
    const match = inReplyTo.match('.*/federation/m/(.*)')
    if (!match || match.length < 2) {
      debug('Resource not found %s', inReplyTo)
      return res.status(404).send('Event not found!')
    }

    let event = await Event.findByPk(Number(match[1]))
    debug('Resource coming for %s', inReplyTo)
    if (!event) {
      // in reply to another resource...
      const resource = await Resource.findOne({ where: { activitypub_id: inReplyTo }, include: [Event] })
      if (!resource) { return res.status(404).send('Not found') }
      event = resource.event
    }
    debug('resource from %s to "%s"', req.body.actor, event.title)

    // clean resource
    body.object.content = sanitize(body.object.content, {
      nonTextTags: ['span', 'style', 'script', 'textarea', 'noscript']
    })

    await Resource.create({
      activitypub_id: body.object.id,
      apUserApId: req.body.actor,
      data: body.object,
      eventId: event.id
    })

    res.sendStatus(201)
  },

  async remove (req, res) {
    const resource = await Resource.findOne({ where: { activitypub_id: req.body.object.id } })
    if (!resource) {
      debug('Comment %s not found', req.body.object.id)
      return res.status(404).send('Not found')
    }
    await resource.destroy()
    debug('Comment %s removed!', req.body.object.id)
    return res.sendStatus(201)
  }
}
