const dayjs = require('dayjs')
const Place = require('../models/place')
const Event = require('../models/event')
const eventController = require('./event')
const log = require('../../log')
const { Op, where, col, fn } = require('sequelize')

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
  },


  async updatePlace (req, res) {
    const place = await Place.findByPk(req.body.id)
    await place.update(req.body)
    res.json(place)
  },

  async get (req, res) {
    const search = req.query.search
    const places = await Place.findAll({
      where: {
        [Op.or]: [
          { name: where(fn('LOWER', col('name')), 'LIKE', '%' + search + '%') },
          { address: where(fn('LOWER', col('address')), 'LIKE', '%' + search + '%') },
        ]
      }
    })

    return res.json(places)
  }  

}