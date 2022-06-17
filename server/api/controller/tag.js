const Tag = require('../models/tag')
const Event = require('../models/event')
const { where, fn, col, Op } = require('sequelize')
const exportController = require('./export')
const eventController = require('./event')

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

  // /feed/rss/tag/tagname
  // /feed/ics/tag/tagname
  // /feed/json/tag/tagname
  async getEvents (req, res) {
    const format = req.params.format || 'json'
    const tags = req.params.tag
    const events = await eventController._select({ tags, show_recurrent: true })

    switch (format) {
      case 'rss':
        return exportController.feed(req, res, events,
            `${res.locals.settings.title} - Tag #${tags}`,
            `${res.locals.settings.baseurl}/feed/rss/tag/${tags}`)
      case 'ics':
        return exportController.ics(req, res, events)
      default:
        return res.json(events)
    }
  },

  /** 
   * search for tags by query string
   * sorted by usage
  */
  async search (req, res) {
    const search = req.query.search
    const tags = await Tag.findAll({
      order: [[fn('COUNT', col('tag.tag')), 'DESC']],
      attributes: ['tag'],
      where: {
        tag: where(fn('LOWER', col('tag')), 'LIKE', '%' + search + '%'),
      },
      include: [{ model: Event, where: { is_visible: true }, attributes: [], through: { attributes: [] }, required: true }],
      group: ['tag.tag'],
      limit: 10,
      subQuery:false
    })

    return res.json(tags.map(t => t.tag))
  }
}