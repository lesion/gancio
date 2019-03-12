const { Event, Comment, Tag, Place } = require('../model')
const { Op } = require('sequelize')
const config = require('../config')
const moment = require('moment')
const ics = require('ics')

const exportController = {

  async export (req, res) {
    console.log('type ', req.params.type)
    const type = req.params.type
    const tags = req.query.tags
    const places = req.query.places
    const whereTag = {}
    const wherePlace = {}
    const yesterday = moment().subtract('1', 'day')
    if (tags) {
      whereTag.tag = tags.split(',')
    }
    if (places) {
      wherePlace.name = places.split(',')
    }
    const events = await Event.findAll({
      order: [['start_datetime', 'ASC']],
      where: { start_datetime: { [Op.gte]: yesterday } },
      include: [Comment, {
        model: Tag,
        where: whereTag
      }, { model: Place, where: wherePlace } ]
    })
    switch (type) {
      case 'feed':
        return exportController.feed(res, events.slice(0, 20))
      case 'ics':
        return exportController.ics(res, events)
    }
  },

  async feed (res, events) {
    res.type('application/rss+xml; charset=UTF-8')
    res.render('feed/rss.pug', { events, config, moment })
  },

  async ics (res, events) {
    const eventsMap = events.map(e => {
      const tmpStart = moment(e.start_datetime)
      const tmpEnd = moment(e.end_datetime)
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
    console.log(error, value)
    res.send(value)
  }
}

module.exports = exportController
