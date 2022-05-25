const dayjs = require('dayjs')
const Tag = require('../models/tag')
const Event = require('../models/event')
const eventController = require('./event')
const Sequelize = require('sequelize')

module.exports = {
  // async getEvents (req, res) {
  //   const name = req.params.placeName
  //   const place = await Place.findOne({ where: { name }})
  //   if (!place) {
  //     log.warn(`Place ${name} not found`)
  //     return res.sendStatus(404)
  //   }
  //   const start = dayjs().unix()
  //   const events = await eventController._select({ start, places: `${place.id}`, show_recurrent: true})

  //   return res.json({ events, place })
  // },

  async get (req, res) {
    const search = req.query.search
    console.error(search)
    const tags = await Tag.findAll({
      order: [[Sequelize.fn('COUNT', Sequelize.col('tag.tag')), 'DESC']],
      attributes: ['tag'],
      where: {
        tag: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('tag')), 'LIKE', '%' + search + '%'),
      },
      include: [{ model: Event, where: { is_visible: true }, attributes: [], through: { attributes: [] }, required: true }],
      group: ['tag.tag'],
      limit: 10,
      subQuery:false
    })

    return res.json(tags.map(t => t.tag))
  }

  // async getPlaces (req, res) {
  //   const search = req.params.search
  //   const places = await Place.findAll({ where: {
  //     [Op.or]: [
  //       { name: }
  //     ]
  //   }})
  // }
}