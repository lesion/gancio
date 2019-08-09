const { event: Event, comment: Comment } = require('../api/models')
const config = require('config')
const debug = require('debug')('fediverse:comment')

module.exports = {
  async create (req, res) {
 
    //search for related event
    const inReplyTo = body.object.inReplyTo
    const match = inReplyTo.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length<2) return res.status(404).send('Event not found!')
    const event = await Event.findByPk(Number(match[1]))

    if (!event) return res.status(404).send('Event not found!')
    debug('comment from %s to %s', req.body.actor, event.titles)

    await Comment.create({
      activitypub_id: body.object.id,
      data: body.object,
      eventId: event.id
    })

    res.sendStatus(201)

  }
}
