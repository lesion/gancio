const { event: Event, comment: Comment } = require('../api/models')
const config = require('config')
const debug = require('debug')('fediverse:comment')

module.exports = {
  async create (req, res) {
    const body = req.body
    //search for related event
    const inReplyTo = body.object.inReplyTo
    const match = inReplyTo.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length<2) return res.status(404).send('Event not found!')
    let event = await Event.findByPk(Number(match[1]))

    debug('comment coming for %s', inReplyTo)
    if (!event) {
      // in reply to another comment...
      const comment = await Comment.findByPk(inReplyTo, { include: [Event] })
      if (!comment) return res.status(404).send('Not found')
      event = comment.event
    }
    debug('comment from %s to "%s"', req.body.actor, event.title)

    await Comment.create({
      activitypub_id: body.object.id,
      data: body.object,
      eventId: event.id
    })

    res.sendStatus(201)

  }
}
