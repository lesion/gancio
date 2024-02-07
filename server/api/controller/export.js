const { Event, Place, Tag } = require('../models/models')

const { htmlToText } = require('html-to-text')
const { Op, literal } = require('sequelize')
const { DateTime } = require('luxon')
const ics = require('ics')
const collectionController = require('./collection')

const exportController = {

  async export (req, res) {
    const format = req.params.format || 'json'
    const tags = req.query.tags
    const places = req.query.places
    const collection = req.query.collection
    const show_recurrent = !!req.query.show_recurrent

    const opt = {
      zone: res.locals.settings.instance_timezone,
      locale: res.locals.settings.instance_locale
    }

    const where = {}
    const yesterday = DateTime.local(opt).minus({day: 1}).toUnixInteger()

    if (!collection) {

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

    }

    if (!show_recurrent) {
      where.parentId = null
    }

    let events = []

    if (collection) {
      events = await collectionController._getEvents({ name: collection })
    } else {
      events = await Event.findAll({
        order: ['start_datetime'],
        attributes: { exclude: ['is_visible', 'recurrent', 'createdAt', 'likes', 'boost', 'userId', 'placeId'] },
        where: {
          is_visible: true,
          recurrent: null,
          apUserApId: null,
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
    }

    switch (format) {
      case 'rss':
      case 'feed':
        return exportController.feed(req, res, events.slice(0, 20))
      case 'ics':
        return exportController.ics(req, res, events)
      case 'json':
        return res.json(events)
    }
    return res.send('Please specify a valid format: rss, feed, ics or json').status(404)
  },

  feed (_req, res, events, title = res.locals.settings.title, link = `${res.locals.settings.baseurl}/feed/rss`) {
    const settings = res.locals.settings

    const opt = {
      zone: settings.instance_timezone,
      locale: settings.instance_locale
    }

    function unixFormat (timestamp, format='EEEE d MMMM HH:mm') {
      return DateTime.fromSeconds(timestamp, opt).toFormat(format)
    }

    res.type('application/rss+xml; charset=UTF-8')
    res.render('feed/rss.pug', { events, settings, unixFormat, title, link })
  },

  /**
   * send an ics of specified events (optionally with reminders)
   * @param {*} events array of events from sequelize
   * @param {*} alarms https://github.com/adamgibbons/ics#attributes (alarms)
   */
  ics (_req, res, events, alarms = []) {
    const settings = res.locals.settings
    const eventsMap = events.map(e => {

      const tmpStart = DateTime.fromSeconds(e.start_datetime, { zone: 'UTC' })
      const start = [ tmpStart.year, tmpStart.month, tmpStart.day, tmpStart.hour, tmpStart.minute ]

      const location = e.place.name !== 'online' ? `${e.place.name} - ${e.place.address}` : `${e.place.name} - ${e?.online_locations[0]}`
      const ret = {
        uid: `${e.id}@${settings.hostname}`,
        start,
        startInputType: 'utc',
        endInputType: 'utc',
        title: e.title,
        description: htmlToText(e.description),
        htmlContent: e.description && e.description.replace(/\n/g,"<br>"),
        location,
        url: `${settings.baseurl}/event/${e.slug || e.id}`,
        status: 'CONFIRMED',
        categories: e.tags.map(t => t.tag || t),
        alarms
      }

      if (e.place.latitude && e.place.longitude) {
        ret.geo = { lat: e.place.latitude, lon: e.place.longitude }
      }

      if (e.end_datetime) {
        const tmpEnd = DateTime.fromSeconds(e.end_datetime, { zone: 'UTC' })
        const end = [ tmpEnd.year, tmpEnd.month, tmpEnd.day, tmpEnd.hour, tmpEnd.minute ]
        ret.end = end
      }

      return ret
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
