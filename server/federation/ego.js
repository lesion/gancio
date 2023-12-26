const { Event } = require('../api/models/models')
const config = require('../config')
const log = require('../log')

module.exports = {
  async boost (req, res) {
    const match = req.body.object.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length < 2) { return res.status(404).send('Event not found!') }
    log.info(`[FEDI] boost ${match[1]}`)
    const event = await Event.findByPk(Number(match[1]))
    if (!event) { return res.status(404).send('Event not found!') }
    // TODO, has to be unique...
    await event.update({ boost: [...event.boost, req.body.actor] })
    res.sendStatus(201)
  },

  async unboost (req, res) {
    const match = req.body.object.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length < 2) { return res.status(404).send('Event not found!') }
    log.info(`unboost ${match[1]}`)
    const event = await Event.findByPk(Number(match[1]))
    if (!event) { return res.status(404).send('Event not found!') }
    await event.update({ boost: event.boost.filter(actor => actor !== req.body.actor) })
  },

  async bookmark (req, res) {
    const match = req.body.object.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length < 2) { return res.status(404).send('Event not found!') }
    const event = await Event.findByPk(Number(match[1]))
    log.info(`${req.body.actor} bookmark ${event.title} (${event.likes.length})`)
    if (!event) { return res.status(404).send('Event not found!') }
    // TODO: has to be unique
    await event.update({ likes: [...event.likes, req.body.actor] })
    res.sendStatus(201)
  },

  async unbookmark (req, res) {
    const body = req.body
    const object = body.object
    const match = object.object.match(`${config.baseurl}/federation/m/(.*)`)
    if (!match || match.length < 2) { return res.status(404).send('Event not found!') }
    const event = await Event.findByPk(Number(match[1]))
    log.info(`${body.actor} unbookmark ${event.title} (${event.likes.length})`)
    if (!event) { return res.status(404).send('Event not found!') }
    await event.update({ likes: event.likes.filter(actor => actor !== body.actor) })
    res.sendStatus(201)
  }
}
