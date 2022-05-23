const dayjs = require('dayjs')
const Place = require('../models/place')
const eventController = require('./event')


module.exports = {
  async getEvents (req, res) {
    const name = req.params.placeName
    const place = await Place.findOne({ where: { name }})
    if (!place) {
      log.warn(`Place ${name} not found`)
      return res.sendStatus(404)
    }
    const start = dayjs().unix()
    const events = await eventController._select({ start, places: `${place.id}`, show_recurrent: true})

    return res.json({ events, place })
  }
}