const Event = require('../models/event')
const Place = require('../models/place')
const Tag = require('../models/tag')

const { Op, literal } = require('sequelize')
const moment = require('dayjs')
const ics = require('ics')
const settingsController = require('./settings')

const exportController = {

  async export (req, res) {
    const type = req.params.type
    const tags = req.query.tags
    const places = req.query.places
    const show_recurrent = !!req.query.show_recurrent

    const where = {}
    const yesterday = moment().subtract('1', 'day').unix()


    if (tags && places) {
      where[Op.or] = {
        placeId: places ? places.split(',') : [],
        '$tags.tag$': tags.split(',')
      }
    }

    if (tags) {
      where['$tags.tag$'] = tags.split(',')
    }

    if (places) {
      where.placeId = places.split(',')
    }

    if (!show_recurrent) {
      where.parentId = null
    }

    const events = await Event.findAll({
      order: ['start_datetime'],
      attributes: { exclude: ['is_visible', 'recurrent', 'createdAt', 'likes', 'boost', 'userId', 'placeId'] },
      where: {
        is_visible: true,
        recurrent: { [Op.eq]: null },
        start_datetime: { [Op.gte]: yesterday },
        ...where
      },
      include: [
        {
          model: Tag,
          order: [literal('(SELECT COUNT("tagTag") FROM event_tags WHERE tagTag = tag) DESC')],
          attributes: ['tag'],
          required: !!tags,
          through: { attributes: [] }
        },
        { model: Place, attributes: ['name', 'id', 'address'] }]
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
    const settings = settingsController.settings
    res.type('application/rss+xml; charset=UTF-8')
    res.render('feed/rss.pug', { events, settings, moment })
  },

  /**
   * send an ics of specified events (optionally with reminders)
   * @param {*} events array of events from sequelize
   * @param {*} alarms https://github.com/adamgibbons/ics#attributes (alarms)
   */
  ics (req, res, events, alarms = []) {
    const settings = settingsController.settings
    const eventsMap = events.map(e => {
      const tmpStart = moment.unix(e.start_datetime)
      const tmpEnd = moment.unix(e.end_datetime)
      const start = tmpStart.utc(true).format('YYYY-M-D-H-m').split('-').map(Number)
      const end = tmpEnd.utc(true).format('YYYY-M-D-H-m').split('-').map(Number)
      return {
        start,
        // startOutputType: 'utc',
        end,
        // endOutputType: 'utc',
        title: `[${settings.title}] ${e.title}`,
        description: e.description,
        location: `${e.place.name} - ${e.place.address}`,
        url: `${settings.baseurl}/event/${e.slug || e.id}`,
        alarms
      }
    })
    res.type('text/calendar; charset=UTF-8')
    ics.createEvents(eventsMap, (err, value) => {
      if (err) {
        return res.status(401).send(err)
      }
      return res.send(value)
    })
  }
}

module.exports = exportController
