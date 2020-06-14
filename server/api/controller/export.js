const { event: Event, place: Place, tag: Tag } = require('../models')
const { Op } = require('sequelize')
const moment = require('moment-timezone')
const ics = require('ics')

const exportController = {

  async export (req, res) {
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
      attributes: { exclude: ['is_visible', 'recurrent', 'createdAt', 'updatedAt', 'likes', 'boost', 'slug', 'userId', 'placeId'] },
      where: {
        is_visible: true,
        recurrent: { [Op.eq]: null },
        start_datetime: { [Op.gte]: yesterday },
        ...where
      },
      include: [{ model: Tag, required: false, ...where_tags }, { model: Place, attributes: ['name', 'id', 'address'] }]
    })

    switch (type) {
      case 'rss':
      case 'feed':
        return exportController.feed(req, res, events.slice(0, 20))
      case 'ics':
        return exportController.ics(req, res, events)
      case 'json':
        return res.json(events)
    }
  },

  feed (req, res, events) {
    res.type('application/rss+xml; charset=UTF-8')
    res.render('feed/rss.pug', { events, settings: req.settings, moment })
  },

  /**
   * send an ics of specified events (optionally with reminders)
   * @param {*} events array of events from sequelize
   * @param {*} alarms https://github.com/adamgibbons/ics#attributes (alarms)
   */
  ics (req, res, events, alarms = []) {
    const eventsMap = events.map(e => {
      const tmpStart = moment.unix(e.start_datetime)
      const tmpEnd = moment.unix(e.end_datetime)
      const start = tmpStart.utc(true).format('YYYY-M-D-H-m').split('-')
      const end = tmpEnd.utc(true).format('YYYY-M-D-H-m').split('-')
      return {
        start,
        // startOutputType: 'utc',
        end,
        // endOutputType: 'utc',
        title: `[${req.settings.title}] ${e.title}`,
        description: e.description,
        location: `${e.place.name} - ${e.place.address}`,
        url: `${req.settings.baseurl}/event/${e.id}`,
        alarms
      }
    })
    res.type('text/calendar; charset=UTF-8')
    const ret = ics.createEvents(eventsMap)
    res.send(ret.value)
  }
}

module.exports = exportController
