const { event: Event, place: Place, tag: Tag } = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')
const ics = require('ics')

const exportController = {

  async export(req, res) {
    const type = req.params.type
    const tags = req.query.tags
    const places = req.query.places

    const where = {}
    const yesterday = moment().subtract('1', 'day').unix()
    let where_tags = {}

    if (tags) {
      where_tags = { where: { tag: tags.split(',') } }
    }

    if (places) {
      where.placeId = places.split(',')
    }
    const events = await Event.findAll({
      order: ['start_datetime'],
      where: {
        is_visible: true,
        start_datetime: { [Op.gte]: yesterday },
        ...where
      },
      include: [ { model: Tag, ...where_tags }, { model: Place, attributes: ['name', 'id', 'address'] }]
    })
    switch (type) {
      case 'feed':
        return exportController.feed(res, events.slice(0, 20))
      case 'ics':
        return exportController.ics(res, events)
      case 'json':
        return res.json(events)
    }
  },

  feed(res, events) {
    res.type('application/rss+xml; charset=UTF-8')
    res.render('feed/rss.pug', { events, config: process.env, moment })
  },

  ics(res, events) {
    const eventsMap = events.map(e => {
      const tmpStart = moment.unix(e.start_datetime)
      const tmpEnd = moment.unix(e.end_datetime)
      const start = [tmpStart.year(), tmpStart.month() + 1, tmpStart.date(), tmpStart.hour(), tmpStart.minute()]
      const end = [tmpEnd.year(), tmpEnd.month() + 1, tmpEnd.date(), tmpEnd.hour(), tmpEnd.minute()]
      return {
        start,
        end,
        title: e.title,
        description: e.description,
        location: e.place.name + ' ' + e.place.address
      }
    })
    res.type('text/calendar; charset=UTF-8')
    const { error, value } = ics.createEvents(eventsMap)
    res.send(value)
  }
}

module.exports = exportController
