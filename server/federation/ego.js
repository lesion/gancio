const { event: Event } = require('../api/models')
const config = require('config')
const debug = require('debug')('fediverse:ego')

module.exports = {
  async boost (req, res) {
    const match = req.body.object.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length < 2) { return res.status(404).send('Event not found!') }
    debug('boost %s', match[1])
    const event = await Event.findByPk(Number(match[1]))
    if (!event) { return res.status(404).send('Event not found!') }
    await event.update({ boost: [...event.boost, req.body.actor] })
    res.sendStatus(201)
  },

  async bookmark (req, res) {
    const match = req.body.object.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length < 2) { return res.status(404).send('Event not found!') }
    const event = await Event.findByPk(Number(match[1]))
    debug('%s bookmark %s (%d)', req.body.actor, event.title, event.likes.length)
    if (!event) { return res.status(404).send('Event not found!') }
    await event.update({ likes: [...event.likes, req.body.actor] })
    res.sendStatus(201)
  },

  async unbookmark (req, res) {
    const body = req.body
    const object = body.object
    const match = object.object.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length < 2) { return res.status(404).send('Event not found!') }
    const event = await Event.findByPk(Number(match[1]))
    debug('%s unbookmark %s (%d)', body.actor, event.title, event.likes.length)
    if (!event) { return res.status(404).send('Event not found!') }
    await event.update({ likes: [...event.likes.filter(actor => actor !== body.actor)] })
    res.sendStatus(201)
  }
}
