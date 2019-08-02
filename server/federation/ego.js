const { event: Event } = require('../api/models')
const config = require('config')

module.exports = {
  async boost (req, res) {
    const event_id = req.body.object.match(`${config.baseurl}/federation/m/(.*)`)[1]
    const event = await Event.findByPk(event_id)
    if (!event) return res.status(404).send('Event not found!')
    await event.update({ boost: [...event.boost, req.body.actor]})
    res.sendStatus(201)
  },
  async like (req, res) {
    const event_id = req.body.object.match(`${config.baseurl}/federation/m/(.*)`)[1]
    const event = await Event.findByPk(event_id)
    if (!event) return res.status(404).send('Event not found!')
    await event.update({ likes: [...event.likes, req.body.actor]})
    res.sendStatus(201)
  }
}