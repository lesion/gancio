const crypto = require('crypto')
const moment = require('moment-timezone')
const { Op } = require('sequelize')
const _ = require('lodash')
const { event: Event, resource: Resource, tag: Tag, place: Place, notification: Notification } = require('../models')
const Sequelize = require('sequelize')
const exportController = require('./export')
const debug = require('debug')('controller:event')
// const { Task, TaskManager } = require('../../taskManager')

const eventController = {

  async _getMeta () {
    const places = await Place.findAll({
      order: [[Sequelize.literal('weigth'), 'DESC']],
      attributes: {
        include: [[Sequelize.fn('count', Sequelize.col('events.placeId')), 'weigth']],
        exclude: ['createdAt', 'updatedAt']
      },
      include: [{ model: Event, attributes: [] }],
      group: ['place.id']
    })

    const tags = await Tag.findAll({
      raw: true,
      order: [['weigth', 'DESC']],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    })

    return { places, tags }
  },

  async getMeta (req, res) {
    res.json(await eventController._getMeta())
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
        const m = _.intersection(event.tags.map(t => t.tag), filters.tags)
        if (m.length > 0) { return true }
      }
      if (filters.places.length) {
        if (filters.places.find(p => p === event.place.name)) {
          return true
        }
      }
    }

    const notifications = await Notification.findAll({ where: { action }, include: [Event] })

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
    const id = Number(req.params.event_id)
    let event
    try {
      event = await Event.findByPk(id, {
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        include: [
          { model: Tag, attributes: ['tag', 'weigth'], through: { attributes: [] } },
          { model: Place, attributes: ['name', 'address'] },
          { model: Resource, where: !is_admin && { hidden: false }, required: false },
          { model: Event, required: false, as: 'parent' }
        ],
        order: [[Resource, 'id', 'DESC']]
      })
    } catch (e) {
      return res.sendStatus(400)
    }

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
      await event.update({ is_visible: false })
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

  async _select (start = moment.unix(), limit = 100) {
    const where = {
      // confirmed event only
      recurrent: null,
      is_visible: true,
      start_datetime: { [Op.gt]: start }
    }

    const events = await Event.findAll({
      where,
      limit,
      attributes: {
        exclude: ['slug', 'likes', 'boost', 'userId', 'is_visible', 'description', 'createdAt', 'updatedAt', 'placeId']
        // include: [[Sequelize.fn('COUNT', Sequelize.col('activitypub_id')), 'ressources']]
      },
      order: ['start_datetime', [Tag, 'weigth', 'DESC']],
      include: [
        { model: Resource, required: false, attributes: ['id'] },
        { model: Tag, attributes: ['tag'], required: false, through: { attributes: [] } },
        { model: Place, required: false, attributes: ['id', 'name', 'address'] }
      ]
    })

    return _(events).map(e => {
      e = e.get()
      e.tags = e.tags ? e.tags.map(t => t && t.tag) : []
      return e
    })
  },

  /**
   * Select events based on params
   */
  async select (req, res) {
    const start = req.query.start || moment().unix()
    const limit = req.query.limit || 100
    res.json(await eventController._select(start, limit))
  },

  /**
   * Ensure we have at least 3 instances of recurrent events
   */
  _createRecurrentOccurrence (e) {
    const event = {
      parentId: e.id,
      title: e.title,
      description: e.description,
      image_path: e.image_path,
      is_visible: e.is_visible,
      userId: e.userId,
      placeId: e.placeId
    }

    const recurrent = e.recurrent
    let left = 3 - e.child.length
    const start = e.child.length ? moment.unix(e.child[e.child.length - 1].start_datetime) : moment()
    let cursor = start.startOf('week')
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
      if (!left) { break }
      left -= 1
      const first_event_of_week = cursor.clone()
      days.forEach(d => {
        debug(cursor)
        if (type === 'ordinal') {
          cursor.date(d)
        } else {
          cursor.day(d - 1)
        }
        event.start_datetime = cursor.unix()
        event.end_datetime = event.start_datetime + duration
        Event.create(event)
        cursor.set('hour', start_date.hour()).set('minute', start_date.minutes())
      })
      cursor = first_event_of_week.add(toAdd.n, toAdd.unit)
    }
  },

  /**
   * Create instances of recurrent events
   * Remove old
   * @param {*} start_datetime
   */
  async _createRecurrent (start_datetime = moment().unix()) {
    // select recurrent events
    const events = await Event.findAll({
      where: { is_visible: true, recurrent: { [Op.ne]: null } },
      include: [{ model: Event, as: 'child', required: false, where: { start_datetime: { [Op.gt]: start_datetime } } }],
      order: ['start_datetime']
    })

    const creations = []
    events
      .filter(e => e.child && e.child.length < 3)
      .forEach(e => {
        eventController._createRecurrentOccurrence(e)
      })

    return Promise.all(creations)
  }
}

module.exports = eventController
