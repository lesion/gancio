const crypto = require('crypto')
const moment = require('moment-timezone')
const { Op } = require('sequelize')
const lodash = require('lodash')
const { event: Event, resource: Resource, tag: Tag, place: Place, notification: Notification } = require('../models')
const Sequelize = require('sequelize')
const exportController = require('./export')
const debug = require('debug')('controller:event')

const eventController = {

  /** add a resource to event
   * @todo not used anywhere, should we use with webmention?
   * @todo should we use this for roply coming from fediverse?
   */
  // async addComment (req, res) {
  //   // comments could be added to an event or to another comment
  //   let event = await Event.findOne({ where: { activitypub_id: { [Op.eq]: req.body.id } } })
  //   if (!event) {
  //     const comment = await Resource.findOne({ where: { activitypub_id: { [Op.eq]: req.body.id } }, include: Event })
  //     event = comment.event
  //   }
  //   const comment = new Comment(req.body)
  //   event.addComment(comment)
  //   res.json(comment)
  // },

  async getMeta (req, res) {
    const places = await Place.findAll({
      order: [[Sequelize.literal('weigth'), 'DESC']],
      attributes: {
        include: [[Sequelize.fn('count', Sequelize.col('events.placeId')), 'weigth']],
        exclude: ['weigth', 'createdAt', 'updatedAt']
      },
      include: [{ model: Event, attributes: [] }],
      group: ['place.id']
    })

    const tags = await Tag.findAll({
      order: [['weigth', 'DESC']],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    })

    res.json({ tags, places })
  },

  async getNotifications (event, action) {
    debug('getNotifications "%s" (%s)', event.title, action)
    function match (event, filters) {
      // matches if no filter specified
      if (!filters) { return true }

      // check for visibility
      if (typeof filters.is_visible !== 'undefined' && filters.is_visible !== event.is_visible) { return false }

      if (!filters.tags && !filters.places) { return true }
      if (!filters.tags.length && !filters.places.length) { return true }
      if (filters.tags.length) {
        const m = lodash.intersection(event.tags.map(t => t.tag), filters.tags)
        if (m.length > 0) { return true }
      }
      if (filters.places.length) {
        if (filters.places.find(p => p === event.place.name)) {
          return true
        }
      }
    }

    const notifications = await Notification.findAll({ where: { action }, include: [ Event ] })

    // get notification that matches with selected event
    const ret = notifications.filter(notification => match(event, notification.filters))
    return ret
  },

  async updatePlace (req, res) {
    const place = await Place.findByPk(req.body.id)
    await place.update(req.body)
    res.json(place)
  },

  // TODO retrieve next/prev event also
  // select id, start_datetime, title from events where start_datetime > (select start_datetime from events where id=89) order by start_datetime limit 20;
  async get (req, res) {
    const format = req.params.format || 'json'
    const is_admin = req.user && req.user.is_admin
    const id = req.params.event_id
    let event = await Event.findByPk(id, {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      include: [
        { model: Tag, attributes: ['tag', 'weigth'], through: { attributes: [] } },
        { model: Place, attributes: ['name', 'address'] },
        { model: Resource, where: !is_admin && { hidden: false }, required: false }
      ],
      order: [ [Resource, 'id', 'DESC'] ]
    })

    if (event && (event.is_visible || is_admin)) {
      event = event.toJSON()
      event.tags = event.tags.map(t => t.tag)
      if (format === 'json') {
        res.json(event)
      } else if (format === 'ics') {
        // last arg is alarms/reminder, ref: https://github.com/adamgibbons/ics#attributes (alarms)
        exportController.ics(req, res, [event], [{
          action: 'display',
          trigger: { hours: 1, before: true }
        }])
      }
    } else {
      res.sendStatus(404)
    }
  },

  /** confirm an anonymous event
   * and send its relative notifications
   */
  async confirm (req, res) {
    const id = Number(req.params.event_id)
    const event = await Event.findByPk(id)
    if (!event) { return res.sendStatus(404) }
    if (!req.user.is_admin && req.user.id !== event.userId) {
      return res.sendStatus(403)
    }

    try {
      event.is_visible = true
      await event.save()

      res.sendStatus(200)

      // send notification
      const notifier = require('../../notifier')
      notifier.notifyEvent('Create', event.id)
    } catch (e) {
      res.sendStatus(404)
    }
  },

  async unconfirm (req, res) {
    const id = Number(req.params.event_id)
    const event = await Event.findByPk(id)
    if (!event) { return req.sendStatus(404) }
    if (!req.user.is_admin && req.user.id !== event.userId) {
      return res.sendStatus(403)
    }

    try {
      event.is_visible = false
      await event.save()
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(404)
    }
  },

  /** get all unconfirmed events */
  async getUnconfirmed (req, res) {
    const events = await Event.findAll({
      where: {
        is_visible: false
      },
      order: [['start_datetime', 'ASC']],
      include: [Tag, Place]
    })
    res.json(events)
  },

  async addNotification (req, res) {
    try {
      const notification = {
        filters: { is_visible: true },
        email: req.body.email,
        type: 'mail',
        remove_code: crypto.randomBytes(16).toString('hex')
      }
      await Notification.create(notification)
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(404)
    }
  },

  async delNotification (req, res) {
    const remove_code = req.params.code
    try {
      const notification = await Notification.findOne({ where: { remove_code: { [Op.eq]: remove_code } } })
      await notification.destroy()
    } catch (e) {
      return res.sendStatus(404)
    }
    res.sendStatus(200)
  },

  async getAll (req, res) {
    // this is due how v-calendar shows dates
    const start = moment()
      .year(req.params.year)
      .month(req.params.month)
      .startOf('month')
      .startOf('week')

    let end = moment()
      .year(req.params.year)
      .month(req.params.month)
      .endOf('month')

    const shownDays = end.diff(start, 'days')
    if (shownDays <= 35) { end = end.add(1, 'week') }
    end = end.endOf('week')

    let events = await Event.findAll({
      where: {
        // return only confirmed events
        is_visible: true,
        [Op.or]: [
          // return all recurrent events regardless start_datetime
          { recurrent: { [Op.ne]: null } },

          // and events in specified range
          { start_datetime: { [Op.between]: [start.unix(), end.unix()] } }
        ]
      },
      attributes: { exclude: [ 'createdAt', 'updatedAt', 'placeId' ] },
      order: [[Tag, 'weigth', 'DESC']],
      include: [
        { model: Resource, required: false, attributes: ['id'] },
        { model: Tag, required: false },
        { model: Place, required: false, attributes: ['id', 'name', 'address'] }
      ]
    })
    events = events.map(e => e.get()).map(e => {
      e.tags = e.tags.map(t => t.tag)
      return e
    })

    // build singular events from a recurrent pattern
    function createEventsFromRecurrent (e, dueTo = null) {
      const events = []
      const recurrent = JSON.parse(e.recurrent)
      if (!recurrent.frequency) { return false }

      let cursor = moment(start).startOf('week')
      const start_date = moment.unix(e.start_datetime)
      const duration = moment.unix(e.end_datetime).diff(start_date, 's')
      const frequency = recurrent.frequency
      const days = recurrent.days
      const type = recurrent.type

      // default frequency is '1d' => each day
      const toAdd = { n: 1, unit: 'day' }

      // each week or 2 (search for the first specified day)
      if (frequency === '1w' || frequency === '2w') {
        cursor.add(days[0] - 1, 'day')
        if (frequency === '2w') {
          const nWeeks = cursor.diff(e.start_datetime, 'w') % 2
          if (!nWeeks) { cursor.add(1, 'week') }
        }
        toAdd.n = Number(frequency[0])
        toAdd.unit = 'week'
        // cursor.set('hour', start_date.hour()).set('minute', start_date.minutes())
      }

      cursor.set('hour', start_date.hour()).set('minute', start_date.minutes())

      // each month or 2
      if (frequency === '1m' || frequency === '2m') {
        // find first match
        toAdd.n = 1
        toAdd.unit = 'month'
        if (type === 'weekday') {

        } else if (type === 'ordinal') {

        }
      }

      // add event at specified frequency
      while (true) {
        const first_event_of_week = cursor.clone()
        days.forEach(d => {
          if (type === 'ordinal') {
            cursor.date(d)
          } else {
            cursor.day(d - 1)
          }
          if (cursor.isAfter(dueTo) || cursor.isBefore(start)) { return }
          e.start_datetime = cursor.unix()
          e.end_datetime = e.start_datetime + duration
          events.push(Object.assign({}, e))
        })
        if (cursor.isAfter(dueTo)) { break }
        cursor = first_event_of_week.add(toAdd.n, toAdd.unit)
        cursor.set('hour', start_date.hour()).set('minute', start_date.minutes())
      }

      return events
    }

    let allEvents = events.filter(e => !e.recurrent || e.recurrent.length === 0)
    events.filter(e => e.recurrent && e.recurrent.length).forEach(e => {
      const events = createEventsFromRecurrent(e, end)
      if (events) { allEvents = allEvents.concat(events) }
    })

    // allEvents.sort((a,b) => a.start_datetime-b.start_datetime)
    res.json(allEvents.sort((a, b) => a.start_datetime - b.start_datetime))
  }

}

module.exports = eventController
