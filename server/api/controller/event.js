const crypto = require('crypto')
const path = require('path')
const config = require('../../config')
const fs = require('fs')
const { Op } = require('sequelize')
const intersection = require('lodash/intersection')
const linkifyHtml = require('linkify-html')
const Sequelize = require('sequelize')
const dayjs = require('dayjs')
const helpers = require('../../helpers')
const settingsController = require('./settings')

const Event = require('../models/event')
const Resource = require('../models/resource')
const Tag = require('../models/tag')
const Place = require('../models/place')
const Notification = require('../models/notification')
const APUser = require('../models/ap_user')

const exportController = require('./export')

const log = require('../../log')

const eventController = {

  async _getMeta (siteId) {
    const places = await Place.findAll({
      where: { siteId },
      order: [[Sequelize.literal('weigth'), 'DESC']],
      attributes: {
        include: [[Sequelize.fn('count', Sequelize.col('events.placeId')), 'weigth']],
        exclude: ['createdAt', 'updatedAt']
      },
      include: [{ model: Event, where: { is_visible: true }, required: true, attributes: [] }],
      group: ['place.id']
    })

    const tags = await Tag.findAll({
      order: [[Sequelize.literal('w'), 'DESC']],
      attributes: {
        include: [[Sequelize.fn('COUNT', Sequelize.col('tag.tag')), 'w']]
      },
      include: [{ model: Event, where: { is_visible: true }, attributes: [], through: { attributes: [] }, required: true }],
      group: ['tag.tag']
    })

    return { places, tags }
  },

  async getMeta (req, res) {
    res.json(await eventController._getMeta(req.siteId))
  },

  async getNotifications (event, action) {
    log.debug(`getNotifications ${event.title} ${action}`)
    function match (event, filters) {
      // matches if no filter specified
      if (!filters) { return true }

      // check for visibility
      if (typeof filters.is_visible !== 'undefined' && filters.is_visible !== event.is_visible) { return false }

      if (!filters.tags && !filters.places) { return true }
      if (!filters.tags.length && !filters.places.length) { return true }
      if (filters.tags.length) {
        const m = intersection(event.tags.map(t => t.tag), filters.tags)
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

  async _get(slug) {
    // retrocompatibility, old events URL does not use slug, use id as fallback
    const id = Number(slug) || -1
    return Event.findOne({
      where: {
        [Op.or]: {
          slug,
          id
        }
      }
    })
  },

  async get (req, res) {
    const format = req.params.format || 'json'
    const is_admin = res.locals.user && res.locals.user.is_admin
    const slug = req.params.event_slug

    // retrocompatibility, old events URL does not use slug, use id as fallback
    const id = Number(slug) || -1
    let event

    try {
      event = await Event.findOne({
        where: {
          [Op.or]: {
            slug,
            id
          }
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'placeId']
        },
        include: [
          { model: Tag, required: false, attributes: ['tag'], through: { attributes: [] } },
          { model: Place, attributes: ['name', 'address', 'id'] },
          {
            model: Resource,
            where: !is_admin && { hidden: false },
            include: [{ model: APUser, required: false, attributes: ['object', 'ap_id'] }],
            required: false,
            attributes: ['id', 'activitypub_id', 'data', 'hidden']
          },
          { model: Event, required: false, as: 'parent', attributes: ['id', 'recurrent', 'is_visible', 'start_datetime'] }
        ],
        order: [[Resource, 'id', 'DESC']]
      })
    } catch (e) {
      log.error('[EVENT]', e)
      return res.sendStatus(400)
    }

    if (!event) {
      return res.sendStatus(404)
    }

    // get prev and next event
    const next = await Event.findOne({
      attributes: ['id', 'slug'],
      where: {
        id: { [Op.not]: event.id },
        is_visible: true,
        recurrent: null,
        [Op.or]: [
          { start_datetime: { [Op.gt]: event.start_datetime } },
          { 
            start_datetime: event.start_datetime,
            id: { [Op.gt]: event.id }
          }
        ]
      },
      order: [['start_datetime', 'ASC'], ['id', 'ASC']]
    })

    const prev = await Event.findOne({
      attributes: ['id', 'slug'],
      where: {
        is_visible: true,
        id: { [Op.not]: event.id },
        recurrent: null,
        [Op.or]: [
          { start_datetime: { [Op.lt]: event.start_datetime } },
          { 
            start_datetime: event.start_datetime,
            id: { [Op.lt]: event.id }
          }
        ]
      },
      order: [['start_datetime', 'DESC'], ['id', 'DESC']]
    })

    // TODO: also check if event is mine
    if (event && (event.is_visible || is_admin)) {
      event = event.get()
      event.next = next && (next.slug || next.id)
      event.prev = prev && (prev.slug || prev.id)
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
    const event = await Event.findByPk(id, { include: [Place, Tag] })
    if (!event) {
      log.warn(`Trying to confirm a unknown event, id: ${id}`)
      return res.sendStatus(404)
    }
    if (!res.locals.user.is_admin && res.locals.user.id !== event.userId) {
      log.warn(`Someone unallowed is trying to confirm -> "${event.title} `)
      return res.sendStatus(403)
    }

    log.info(`Event "${event.title}" confirmed`)
    try {
      event.is_visible = true

      await event.save()

      res.sendStatus(200)

      // send notification
      const notifier = require('../../notifier')
      notifier.notifyEvent('Create', event.id)
    } catch (e) {
      log.error('[EVENT]', e)
      res.sendStatus(404)
    }
  },

  async unconfirm (req, res) {
    const id = Number(req.params.event_id)
    const event = await Event.findByPk(id)
    if (!event) { return req.sendStatus(404) }
    if (!res.locals.user.is_admin && res.locals.user.id !== event.userId) {
      return res.sendStatus(403)
    }

    try {
      await event.update({ is_visible: false })
      res.sendStatus(200)
    } catch (e) {
      log.info(e)
      res.sendStatus(404)
    }
  },

  /** get all unconfirmed events */
  async getUnconfirmed (req, res) {
    try {
      const events = await Event.findAll({
        where: {
          parentId: null,
          siteId: req.siteId,
          is_visible: false,
          start_datetime: { [Op.gt]: dayjs().unix() }
        },
        order: [['start_datetime', 'ASC']],
        include: [{ model: Tag, required: false }, Place]
      })
      res.json(events)
    } catch (e) {
      log.info(e)
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
      log.warn(req.err)
      return res.status(400).json(req.err.toString())
    }

    try {
      const body = req.body
      const recurrent = body.recurrent ? JSON.parse(body.recurrent) : null

      if (!body.place_name) {
        log.warn('Place is required')
        return res.status(400).send('Place is required')
      }

      const eventDetails = {
        title: body.title,
        // remove html tags
        description: helpers.sanitizeHTML(linkifyHtml(body.description)),
        multidate: body.multidate,
        start_datetime: body.start_datetime,
        end_datetime: body.end_datetime,
        recurrent,
        siteId: req.siteId,
        // publish this event only if authenticated
        is_visible: !!res.locals.user
      }

      if (req.file || body.image_url) {
        let url
        if (req.file) {
          url = req.file.filename
        } else {
          url = await helpers.getImageFromURL(body.image_url)
        }

        let focalpoint = body.image_focalpoint ? body.image_focalpoint.split(',') : ['0', '0']
        focalpoint = [parseFloat(focalpoint[0]).toFixed(2), parseFloat(focalpoint[1]).toFixed(2)]
        eventDetails.media = [{
          url,
          name: body.image_name || body.title || '',
          focalpoint: [parseFloat(focalpoint[0]), parseFloat(focalpoint[1])]
        }]
      } else {
        eventDetails.media = []
      }

      const event = await Event.create(eventDetails)

      const [place] = await Place.findOrCreate({
        where: { name: body.place_name, siteId: req.siteId },
        defaults: {
          address: body.place_address,
          siteId: req.siteId
        }
      })

      await event.setPlace(place)
      event.place = place

      // create/assign tags
      if (body.tags) {
        await Tag.bulkCreate(body.tags.map(t => ({ tag: t })), { ignoreDuplicates: true })
        const tags = await Tag.findAll({ where: { tag: { [Op.in]: body.tags } } })
        await event.addTags(tags)
        event.tags = tags
      }

      // associate user to event and reverse
      if (res.locals.user) {
        await res.locals.user.addEvent(event)
        await event.setUser(res.locals.user)
      }

      // return created event to the client
      res.json(event)

      // create recurrent instances of event if needed
      // without waiting for the task manager
      if (event.recurrent) {
        eventController._createRecurrent()
      } else {
        // send notifications
        const notifier = require('../../notifier')
        notifier.notifyEvent('Create', event.id)
      }
    } catch (e) {
      log.error('[EVENT ADD]', e)
      res.sendStatus(400)
    }
  },

  async update (req, res) {
    if (res.locals.err) {
      return res.status(400).json(res.locals.err.toString())
    }

    try {
      const body = req.body
      const event = await Event.findByPk(body.id)
      if (!event) { return res.sendStatus(404) }
      if (!res.locals.user.is_admin && event.userId !== res.locals.user.id) {
        return res.sendStatus(403)
      }

      const recurrent = body.recurrent ? JSON.parse(body.recurrent) : null
      const eventDetails = {

        // remove html tags
        description: helpers.sanitizeHTML(linkifyHtml(body.description, { target: '_blank' })),
        multidate: body.multidate,
        start_datetime: body.start_datetime,
        siteId: req.siteId,
        end_datetime: body.end_datetime,
        recurrent
      }

      if ((req.file || /^https?:\/\//.test(body.image_url)) && !event.recurrent && event.media && event.media.length) {
        const old_path = path.resolve(config.upload_path, event.media[0].url)
        const old_thumb_path = path.resolve(config.upload_path, 'thumb', event.media[0].url)
        try {
          fs.unlinkSync(old_path)
          fs.unlinkSync(old_thumb_path)
        } catch (e) {
          log.info(e.toString())
        }
      }
      let url
      if (req.file) {
        url = req.file.filename
      } else if (body.image_url) {
        if (/^https?:\/\//.test(body.image_url)) {
          url = await helpers.getImageFromURL(body.image_url)
        } else {
          url = body.image_url
        }
      }

      if (url && !event.recurrent) {
        const focalpoint = body.image_focalpoint ? body.image_focalpoint.split(',') : ['0', '0']
        eventDetails.media = [{
          url,
          name: body.image_name || '',
          focalpoint: [parseFloat(focalpoint[0].slice(0, 6)), parseFloat(focalpoint[1].slice(0, 6))]
        }]
      } else {
        eventDetails.media = []
      }

      await event.update(eventDetails)
      const [place] = await Place.findOrCreate({
        where: { name: body.place_name },
        defaults: { address: body.place_address }
      })

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
      } else {
        const notifier = require('../../notifier')
        notifier.notifyEvent('Update', event.id)
      }
    } catch (e) {
      log.error('[EVENT UPDATE]', e)
      res.sendStatus(400)
    }
  },

  async remove (req, res) {
    const event = await Event.findByPk(req.params.id)
    // check if event is mine (or user is admin)
    if (event && (res.locals.user.is_admin || res.locals.user.id === event.userId)) {
      if (event.media && event.media.length && !event.recurrent) {
        const old_path = path.join(config.upload_path, event.media[0].url)
        const old_thumb_path = path.join(config.upload_path, 'thumb', event.media[0].url)
        try {
          fs.unlinkSync(old_thumb_path)
          fs.unlinkSync(old_path)
        } catch (e) {
          log.info(e.toString())
        }
      }
      const notifier = require('../../notifier')
      await notifier.notifyEvent('Delete', event.id)

      // unassociate child events
      if (event.recurrent) {
        await Event.update({ parentId: null }, { where: { parentId: event.id } })
      }
      log.debug('[EVENT REMOVED] ' + event.title)
      await event.destroy()
      res.sendStatus(200)
    } else {
      res.sendStatus(403)
    }
  },

  async _select ({ siteId, start, end, tags, places, show_recurrent, max }) {

    const where = {
      // do not include parent recurrent event
      recurrent: null,

      // confirmed event only
      is_visible: true,

      siteId,

      [Op.or]: {
        start_datetime: { [Op.gte]: start },
        end_datetime: { [Op.gte]: start }
      }
    }

    if (!show_recurrent) {
      where.parentId = null
    }
    if (end) {
      where.start_datetime = { [Op.lte]: end }
    }

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

    const events = await Event.findAll({
      where,
      attributes: {
        exclude: ['likes', 'boost', 'userId', 'is_visible', 'createdAt', 'updatedAt', 'description', 'resources']
      },
      order: ['start_datetime'],
      include: [
        { model: Resource, required: false, attributes: ['id'] },
        {
          model: Tag,
          order: [Sequelize.literal('(SELECT COUNT("tagTag") FROM event_tags WHERE tagTag = tag) DESC')],
          attributes: ['tag'],
          required: !!tags,
          through: { attributes: [] }
        },
        { model: Place, required: true, attributes: ['id', 'name', 'address'] }
      ],
      limit: max
    }).catch(e => {
      log.error('[EVENT]', e)
      return []
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
    const start = req.query.start || dayjs().unix()
    const end = req.query.end
    const tags = req.query.tags
    const places = req.query.places
    const max = req.query.max

    const show_recurrent = settingsController.settings.allow_recurrent_event &&
      typeof req.query.show_recurrent !== 'undefined' ? req.query.show_recurrent === 'true' : settingsController.settings.recurrent_event_visible

    res.json(await eventController._select({
      siteId: req.siteId, start, end, places, tags, show_recurrent, max
    }))
  },

  /**
   * Ensure we have the next instance of a recurrent event
   */
  async _createRecurrentOccurrence (e, startAt) {
    log.debug(`Create recurrent event [${e.id}] ${e.title}"`)
    const event = {
      parentId: e.id,
      title: e.title,
      description: e.description,
      media: e.media,
      is_visible: true,
      userId: e.userId,
      placeId: e.placeId,
      siteId: e.siteId
    }

    const recurrent = e.recurrent
    const start_date = dayjs.unix(e.start_datetime)
    let cursor = start_date > startAt ? start_date : startAt
    startAt = cursor
    const duration = dayjs.unix(e.end_datetime).diff(start_date, 's')
    const frequency = recurrent.frequency
    const type = recurrent.type

    cursor = cursor.hour(start_date.hour()).minute(start_date.minute()).second(0)

    if (!frequency) { return }

    // each week or 2
    if (frequency[1] === 'w') {
      cursor = cursor.day(start_date.day())
      if (cursor.isBefore(startAt)) {
        cursor = cursor.add(7, 'day')
      }
      if (frequency[0] === '2') {
        cursor = cursor.add(7, 'day')
      }
    } else if (frequency === '1m') {
      if (type === 'ordinal') {
        cursor = cursor.date(start_date.date())

        if (cursor.isBefore(startAt)) {
          cursor = cursor.add(1, 'month')
        }
      } else { // weekday
        // get weekday
        // get recurrent freq details
        cursor = helpers.getWeekdayN(cursor, type, start_date.day())
        if (cursor.isBefore(startAt)) {
          cursor = cursor.add(4, 'week')
          cursor = helpers.getWeekdayN(cursor, type, start_date.day())
        }
      }
    }
    log.debug(cursor)
    event.start_datetime = cursor.unix()
    event.end_datetime = event.start_datetime + duration
    const newEvent = await Event.create(event)
    return newEvent.addTags(e.tags)
  },

  /**
   * Create instances of recurrent events
   */
  async _createRecurrent (start_datetime = dayjs().unix()) {
    // select recurrent events and its childs
    const events = await Event.findAll({
      where: { is_visible: true, recurrent: { [Op.ne]: null } },
      include: [{ model: Tag, required: false },
        { model: Event, as: 'child', required: false, where: { start_datetime: { [Op.gte]: start_datetime } }}],
      order: [['child', 'start_datetime', 'DESC']]
    })

    // create a new occurrence for each recurring events but the one's that has an already visible occurrence coming
    const creations = events.map(e => {
      if (e.child.length) {
        if (e.child.find(c => c.is_visible)) return
        return eventController._createRecurrentOccurrence(e, dayjs.unix(e.child[0].start_datetime+1))
      }
      return eventController._createRecurrentOccurrence(e, dayjs())
    })

    return Promise.all(creations)
  }
}

module.exports = eventController
