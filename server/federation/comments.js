const { event: Event, comment: Comment } = require('../api/models')
const config = require('config')

module.exports = {
  async create (body) {
 
    //search for related event
    const inReplyTo = body.object.inReplyTo
    const event_id = inReplyTo.match(`${config.baseurl}/federation/m/(.*)`)[1]

    console.error(event_id)
    const event = await Event.findByPk(event_id)
    if (!event) {
      return console.error('event not found!')
    }

     return await Comment.create({
       activitypub_id: body.object.id,
       data: body.object,
       eventId: event.id
     })


  }
}
