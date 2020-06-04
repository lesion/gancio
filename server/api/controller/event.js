const crypto = require('crypto')
const moment = require('moment-timezone')
const path = require('path')
const config = require('config')
const fs = require('fs')
const { Op } = require('sequelize')
const _ = require('lodash')
const helpers = require('../../helpers')
const linkifyHtml = require('linkifyjs/html')
const Sequelize = require('sequelize')

const {
  event: Event,
  resource: Resource,
  tag: Tag,
  place: Place,
  notification: Notification,
  ap_user: APUser
} = require('../models')
const exportController = require('./export')

const debug = require('debug')('controller:event')

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

  async get (req, res) {
    const format = req.params.format || 'json'
    const is_admin = req.user && req.user.is_admin
    const id = Number(req.params.event_id)
    let event

    try {
      event = await Event.findByPk(id, {
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'placeId']
        },
        include: [
          { model: Tag, required: false, attributes: ['tag', 'weigth'], through: { attributes: [] } },
          { model: Place, attributes: ['name', 'address', 'id'] },
          {
            model: Resource,
            where: !is_admin && { hidden: false },
            include: [{ model: APUser, required: false, attributes: ['object', 'ap_id'] }],
            required: false,
            attributes: ['id', 'activitypub_id', 'data', 'hidden']
          },
          { model: Event, required: false, as: 'parent', attributes: ['id', 'recurrent', 'is_visible'] }
        ],
        order: [[Resource, 'id', 'DESC']]
      })
    } catch (e) {
      return res.sendStatus(400)
    }

    if (!event) {
      return res.sendStatus(400)
    }

    // get prev and next event
    const next = await Event.findOne({
      attributes: ['id'],
      where: {
        is_visible: true,
        parentId: null,
        start_datetime: { [Op.gt]: event.start_datetime }
      },
      order: [['start_datetime', 'ASC']]
    })

    const prev = await Event.findOne({
      attributes: ['id'],
      where: {
        is_visible: true,
        parentId: null,
        start_datetime: { [Op.lt]: event.start_datetime }
      },
      order: [['start_datetime', 'DESC']]
    })

    if (event && (event.is_visible || is_admin)) {
      event = event.get()
      event.next = next && next.id
      event.prev = prev && prev.id
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
   * and send related notifications
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
      debug(e)
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
      debug(e)
      res.sendStatus(404)
    }
  },

  /** get all unconfirmed events */
  async getUnconfirmed (req, res) {
    try {
      const events = await Event.findAll({
        where: {
          parentId: null,
          is_visible: false,
          start_datetime: { [Op.gt]: moment().unix() }
        },
        order: [['start_datetime', 'ASC']],
        include: [{ model: Tag, required: false }, Place]
      })
      res.json(events)
    } catch (e) {
      debug(e)
      res.sendStatus(400)
    }
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
      const notification = await Notification.findOne({ where: { remove_code } })
      await notification.destroy()
    } catch (e) {
      return res.sendStatus(404)
    }
    res.sendStatus(200)
  },

  async add (req, res) {
    // req.err comes from multer streaming error
    if (req.err) {
      debug(req.err)
      return res.status(400).json(req.err.toString())
    }

    try {
      const body = req.body
      const recurrent = body.recurrent ? JSON.parse(body.recurrent) : null

      const eventDetails = {
        title: body.title,
        // remove html tags
        description: helpers.sanitizeHTML(linkifyHtml(body.description)),
        multidate: body.multidate,
        start_datetime: body.start_datetime,
        end_datetime: body.end_datetime,
        recurrent,
        // publish this event only if authenticated
        is_visible: !!req.user
      }

      if (req.file) {
        eventDetails.image_path = req.file.filename
      } else if (body.image_url) {
        eventDetails.image_path = await helpers.getImageFromURL(body.image_url)
      }

      const event = await Event.create(eventDetails)

      // TOFIX: check if place is specified
      // create place if needed
      const place = await Place.findOrCreate({
        where: { name: body.place_name },
        defaults: { address: body.place_address }
      }).spread((place, created) => place)

      await event.setPlace(place)
      event.place = place

      // create/assign tags
      if (body.tags) {
        await Tag.bulkCreate(body.tags.map(t => ({ tag: t })), { ignoreDuplicates: true })
        const tags = await Tag.findAll({ where: { tag: { [Op.in]: body.tags } } })
        await Promise.all(tags.map(t => t.update({ weigth: Number(t.weigth) + 1 })))
        await event.addTags(tags)
        event.tags = tags
      }

      // associate user to event and reverse
      if (req.user) {
        await req.user.addEvent(event)
        await event.setUser(req.user)
      }

      // create recurrent instances of event if needed
      // without waiting for the task manager
      if (event.recurrent) {
        eventController._createRecurrent()
      }

      // return created event to the client
      res.json(event)

      // send notifications (mastodon / email)
      const notifier = require('../../notifier')
      notifier.notifyEvent('Create', event.id)
    } catch (e) {
      debug(e)
      res.sendStatus(400)
    }
  },

  async update (req, res) {
    if (req.err) {
      return res.status(400).json(req.err.toString())
    }
    const body = req.body
    const event = await Event.findByPk(body.id)
    if (!event) { return res.sendStatus(404) }
    if (!req.user.is_admin && event.userId !== req.user.id) {
      return res.sendStatus(403)
    }

    const recurrent = body.recurrent ? JSON.parse(body.recurrent) : null
    const eventDetails = {
      title: body.title,
      // remove html tags
      description: helpers.sanitizeHTML(linkifyHtml(body.description)),
      multidate: body.multidate,
      start_datetime: body.start_datetime,
      end_datetime: body.end_datetime,
      recurrent
    }

    if (req.file) {
      if (event.image_path && !event.recurrent) {
        const old_path = path.resolve(config.upload_path, event.image_path)
        const old_thumb_path = path.resolve(config.upload_path, 'thumb', event.image_path)
        try {
          await fs.unlinkSync(old_path)
          await fs.unlinkSync(old_thumb_path)
        } catch (e) {
          debug(e.toString())
        }
      }
      eventDetails.image_path = req.file.filename
    } else if (body.image_url) {
      eventDetails.image_path = await helpers.getImageFromURL(body.image_url)
    }

    await event.update(eventDetails)
    let place
    try {
      place = await Place.findOrCreate({
        where: { name: body.place_name },
        defaults: { address: body.place_address }
      }).spread((place, created) => place)
    } catch (e) {
      debug(e)
    }
    await event.setPlace(place)
    await event.setTags([])
    if (body.tags) {
      await Tag.bulkCreate(body.tags.map(t => ({ tag: t })), { ignoreDuplicates: true })
      const tags = await Tag.findAll({ where: { tag: { [Op.in]: body.tags } } })
      await event.addTags(tags)
    }
    const newEvent = await Event.findByPk(event.id, { include: [Tag, Place] })
    res.json(newEvent)

    // create recurrent instances of event if needed
    // without waiting for the task manager
    if (event.recurrent) {
      eventController._createRecurrent()
    }

    const notifier = require('../../notifier')
    notifier.notifyEvent('Update', event.id)
  },

  async remove (req, res) {
    const event = await Event.findByPk(req.params.id)
    // check if event is mine (or user is admin)
    if (event && (req.user.is_admin || req.user.id === event.userId)) {
      if (event.image_path && !event.recurrent) {
        const old_path = path.join(config.upload_path, event.image_path)
        const old_thumb_path = path.join(config.upload_path, 'thumb', event.image_path)
        try {
          fs.unlinkSync(old_thumb_path)
          fs.unlinkSync(old_path)
        } catch (e) {
          debug(e.toString())
        }
      }
      const notifier = require('../../notifier')
      await notifier.notifyEvent('Delete', event.id)
      await event.destroy()
      res.sendStatus(200)
    } else {
      res.sendStatus(403)
    }
  },

  async _select (start = moment().unix(), limit = 100) {
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
        exclude: ['slug', 'likes', 'boost', 'userId', 'is_visible', 'createdAt', 'updatedAt', 'placeId']
        // include: [[Sequelize.fn('COUNT', Sequelize.col('activitypub_id')), 'ressources']]
      },
      order: ['start_datetime', [Tag, 'weigth', 'DESC']],
      include: [
        { model: Resource, required: false, attributes: ['id'] },
        { model: Tag, attributes: ['tag'], required: false, through: { attributes: [] } },
        { model: Place, required: false, attributes: ['id', 'name', 'address'] }
      ]
    })

    return events.map(e => {
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
   * Ensure we have the next instances of recurrent events
   */
  _createRecurrentOccurrence (e) {
    const event = {
      parentId: e.id,
      title: e.title,
      description: e.description,
      image_path: e.image_path,
      is_visible: true,
      userId: e.userId,
      placeId: e.placeId
    }

    const recurrent = e.recurrent
    const cursor = moment()
    // let cursor = start.startOf('week')
    const start_date = moment.unix(e.start_datetime)
    const duration = moment.unix(e.end_datetime).diff(start_date, 's')
    const frequency = recurrent.frequency
    const days = recurrent.days
    const type = recurrent.type

    // default frequency is '1d' => each day
    const toAdd = { n: 1, unit: 'day' }

    // each week or 2 (search for the first specified day)
    if (frequency === '1w' || frequency === '2w') {
      // cursor.add(days[0] - 1, 'day')
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
    // const first_event_of_week = cursor.clone()
    days.forEach(d => {
      if (type === 'ordinal') {
        cursor.date(d)
      } else {
        cursor.day(d - 1)
        if (cursor.isBefore(moment())) {
          cursor.day(d - 1 + 7)
        }
      }
      event.start_datetime = cursor.unix()
      event.end_datetime = event.start_datetime + duration
      Event.create(event)
      cursor.set('hour', start_date.hour()).set('minute', start_date.minutes())
    })
    // cursor = first_event_of_week.add(toAdd.n, toAdd.unit)
  },

  /**
   * Create instances of recurrent events
   */
  async _createRecurrent (start_datetime = moment().unix()) {
    // select recurrent events
    const events = await Event.findAll({
      where: { is_visible: true, recurrent: { [Op.ne]: null } },
      include: [{ model: Event, as: 'child', required: false, where: { start_datetime: { [Op.gte]: start_datetime } } }],
      order: ['start_datetime']
    })

    const creations = events
      .filter(e => e.child.length === 0)
      .map(eventController._createRecurrentOccurrence)

    return Promise.all(creations)
  }
}

module.exports = eventController
