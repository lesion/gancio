const crypto = require('crypto')
const path = require('path')
const config = require('../../config')
const fs = require('fs/promises')
const { Op } = require('sequelize')
const linkifyHtml = require('linkify-html')
const Sequelize = require('sequelize')
const { DateTime } = require('luxon')
const helpers = require('../../helpers')
const Col = helpers.col
const notifier = require('../../notifier')

const { Event, Resource, Tag, Place, Notification, APUser } = require('../models/models')


const exportController = require('./export')
const tagController = require('./tag')

const log = require('../../log')

const eventController = {

  async _findOrCreatePlace (body) {
    if (body.place_id) {
      const place = await Place.findByPk(body.place_id)
      if (!place) {
        throw new Error(`Place not found`)
      }
      return place
    }

    const place_name = body.place_name && body.place_name.trim()
    const place_address = body.place_address && body.place_address.trim()
    if (!place_address || !place_name) {
      throw new Error(`place_id or place_name and place_address are required`)
    }    
    let place = await Place.findOne({ where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), Sequelize.Op.eq, place_name.toLocaleLowerCase()) })
    if (!place) {
      place = await Place.create({
        name: place_name,
        address: place_address,
        latitude: Number(body.place_latitude) || null,
        longitude: Number(body.place_longitude) || null
      })
    }
    return place
  },

  async searchMeta(req, res) {
    const search = req.query.search

    const places = await Place.findAll({
      order: [[Sequelize.col('w'), 'DESC']],
      where: {
        [Op.or]: [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + search + '%'),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('address')), 'LIKE', '%' + search + '%')
        ]
      },
      attributes: [['name', 'label'], 'address', 'latitude', 'longitude', 'id', [Sequelize.cast(Sequelize.fn('COUNT', Sequelize.col('events.placeId')), 'INTEGER'), 'w']],
      include: [{ model: Event, where: { is_visible: true }, required: true, attributes: [] }],
      group: ['place.id'],
      raw: true
    })

    const tags = await Tag.findAll({
      order: [[Sequelize.col('w'), 'DESC']],
      where: {
        tag: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('tag')), 'LIKE', '%' + search + '%'),
      },
      attributes: [['tag', 'label'], [Sequelize.cast(Sequelize.fn('COUNT', Sequelize.col('tag.tag')), 'INTEGER'), 'w']],
      include: [{ model: Event, where: { is_visible: true }, attributes: [], through: { attributes: [] }, required: true }],
      group: ['tag.tag'],
      raw: true
    })

    const ret = places.map(p => {
      p.type = 'place'
      return p
    }).concat(tags.map(t => {
      t.type = 'tag'
      return t
    })).sort((a, b) => b.w - a.w).slice(0, 10)

    return res.json(ret)
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

  async get(req, res) {
    const format = req.params.format || 'json'
    const is_admin = req.user && req.user.is_admin
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
          { model: Place, attributes: ['name', 'address', 'latitude', 'longitude', 'id'] },
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
          description: event.title,
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
  async confirm(req, res) {
    const id = Number(req.params.event_id)
    const event = await Event.findByPk(id, { include: [Place, Tag] })
    if (!event) {
      log.warn(`Trying to confirm a unknown event, id: ${id}`)
      return res.sendStatus(404)
    }
    if (!req.user.is_admin && req.user.id !== event.userId) {
      log.warn(`Someone not allowed is trying to confirm -> "${event.title} `)
      return res.sendStatus(403)
    }

    log.info(`Event "${event.title}" confirmed`)
    try {
      event.is_visible = true

      await event.save()

      res.sendStatus(200)

      // send notification
      notifier.notifyEvent('Create', event.id)
    } catch (e) {
      log.error('[EVENT]', e)
      res.sendStatus(404)
    }
  },

  async unconfirm(req, res) {
    const id = Number(req.params.event_id)
    const event = await Event.findByPk(id)
    if (!event) { return req.sendStatus(404) }
    if (!req.user.is_admin && req.user.id !== event.userId) {
      log.warn(`Someone not allowed is trying to unconfirm -> "${event.title} `)
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
  async getUnconfirmed(_req, res) {
    try {
      const events = await Event.findAll({
        where: {
          parentId: null,
          is_visible: false,
          start_datetime: { [Op.gt]: DateTime.local().toUnixInteger() }
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

  async addNotification(req, res) {
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

  async delNotification(req, res) {
    const remove_code = req.params.code
    try {
      const notification = await Notification.findOne({ where: { remove_code } })
      await notification.destroy()
    } catch (e) {
      return res.sendStatus(404)
    }
    res.sendStatus(200)
  },

  async isAnonEventAllowed(req, res, next) {
    if (!res.locals.settings.allow_anon_event && !req.user) {
      return res.sendStatus(403)
    }
    next()
  },

  async add(req, res) {
    // req.err comes from multer streaming error
    if (req.err) {
      log.warn(req.err)
      return res.status(400).json(req.err.toString())
    }

    try {
      const body = req.body
      const recurrent = body.recurrent ? JSON.parse(body.recurrent) : null

      const required_fields = ['title', 'start_datetime']
      let missing_field = required_fields.find(required_field => !body[required_field])
      if (missing_field) {
        log.warn(`${missing_field} required`)
        return res.status(400).send(`${missing_field} required`)
      }

      // find or create the place
      let place
      try {
        place = await eventController._findOrCreatePlace(body)
        if (!place) {
          return res.status(400).send(`Place not found`)
        }
      } catch (e) {
        log.error(e.message)
        return res.status(400).send(e.message)
      }


      const eventDetails = {
        title: body.title.trim(),
        // sanitize and linkify html
        description: helpers.sanitizeHTML(linkifyHtml(body.description || '')),
        multidate: body.multidate,
        start_datetime: body.start_datetime,
        end_datetime: body.end_datetime,
        recurrent,
        // publish this event only if authenticated
        is_visible: !!req.user
      }

      if (req.file || body.image_url) {
        if (!req.file && body.image_url) {
          req.file = await helpers.getImageFromURL(body.image_url)
        }

        let focalpoint = body.image_focalpoint ? body.image_focalpoint.split(',') : ['0', '0']
        focalpoint = [parseFloat(parseFloat(focalpoint[0]).toFixed(2)), parseFloat(parseFloat(focalpoint[1]).toFixed(2))]
        eventDetails.media = [{
          url: req.file.filename,
          height: req.file.height,
          width: req.file.width,
          name: body.image_name || body.title || '',
          size: req.file.size || 0,
          focalpoint
        }]
      } else {
        eventDetails.media = []
      }

      let event = await Event.create(eventDetails)

      await event.setPlace(place)

      // create/assign tags
      let tags = []
      if (body.tags) {
        tags = await tagController._findOrCreate(body.tags)
        await event.setTags(tags)
      }

      // associate user to event and reverse
      if (req.user) {
        await req.user.addEvent(event)
        await event.setUser(req.user)
      }

      event = event.get()
      event.tags = tags.map(t => t.tag)
      event.place = place
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

  async update(req, res) {
    if (res.err) {
      log.warn(req.err)
      return res.status(400).json(req.err.toString())
    }

    try {
      const body = req.body
      const event = await Event.findByPk(body.id)
      if (!event) { return res.sendStatus(404) }
      if (!req.user.is_admin && event.userId !== req.user.id) {
        return res.sendStatus(403)
      }

      const recurrent = body.recurrent ? JSON.parse(body.recurrent) : null
      const eventDetails = {
        title: body.title || event.title,
        // sanitize and linkify html
        description: helpers.sanitizeHTML(linkifyHtml(body.description || '', { target: '_blank' })) || event.description,
        multidate: body.multidate,
        start_datetime: body.start_datetime || event.start_datetime,
        end_datetime: body.end_datetime || null,
        recurrent
      }

      // remove old media in case a new one is uploaded
      if ((req.file || /^https?:\/\//.test(body.image_url)) && !event.recurrent && event.media && event.media.length) {
        try {
          const old_path = path.resolve(config.upload_path, event.media[0].url)
          const old_thumb_path = path.resolve(config.upload_path, 'thumb', event.media[0].url)
          await fs.unlink(old_path)
          await fs.unlink(old_thumb_path)
        } catch (e) {
          log.info(e.toString())
        }
      }

      // modify associated media only if a new file is uploaded or remote image_url is used
      if (req.file || (body.image_url && /^https?:\/\//.test(body.image_url))) {
        if (!req.file && body.image_url) {
          req.file = await helpers.getImageFromURL(body.image_url)
        }

        let focalpoint = body.image_focalpoint ? body.image_focalpoint.split(',') : ['0', '0']
        focalpoint = [parseFloat(parseFloat(focalpoint[0]).toFixed(2)), parseFloat(parseFloat(focalpoint[1]).toFixed(2))]
        eventDetails.media = [{
          url: req.file.filename,
          height: req.file.height,
          width: req.file.width,
          name: body.image_name || body.title || '',
          size: req.file.size || 0,
          focalpoint
        }]
      } else if (!body.image) {
        eventDetails.media = []
      } else if (body.image_focalpoint && event.media.length) {
        let focalpoint = body.image_focalpoint ? body.image_focalpoint.split(',') : ['0', '0']
        focalpoint = [parseFloat(parseFloat(focalpoint[0]).toFixed(2)), parseFloat(parseFloat(focalpoint[1]).toFixed(2))]
        eventDetails.media = [{ ...event.media[0], focalpoint }] // [0].focalpoint = focalpoint
      }
      await event.update(eventDetails)

      // find or create the place
      let place
      try {
        place = await eventController._findOrCreatePlace(body)
        if (!place) {
          return res.status(400).send(`Place not found`)
        }
      } catch (e) {
        return res.status(400).send(e.message)
      }
      await event.setPlace(place)

      // create/assign tags
      let tags = []
      if (body.tags) {
        tags = await tagController._findOrCreate(body.tags)
      }
      await event.setTags(tags)

      let newEvent = await Event.findByPk(event.id, { include: [Tag, Place] })
      newEvent = newEvent.get()
      newEvent.tags = tags.map(t => t.tag)
      newEvent.place = place
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

  async remove(req, res) {
    const event = await Event.findByPk(req.params.id)
    // check if event is mine (or user is admin)
    if (event && (req.user.is_admin || req.user.id === event.userId)) {
      if (event.media && event.media.length && !event.recurrent) {
        try {
          const old_path = path.join(config.upload_path, event.media[0].url)
          const old_thumb_path = path.join(config.upload_path, 'thumb', event.media[0].url)
          await fs.unlink(old_thumb_path)
          await fs.unlink(old_path)
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

  /**
   * Method to search for events with pagination and filtering
   * @returns
   */
  async _select({
    start = DateTime.local().toUnixInteger(),
    end,
    query,
    tags,
    places,
    show_recurrent,
    show_multidate,
    limit,
    page,
    older,
    reverse }) {

    const where = {
      // do not include _parent_ recurrent event
      recurrent: null,

      // confirmed event only
      is_visible: true,

      [Op.or]: {
        start_datetime: { [older ? Op.lte : Op.gte]: start },
        end_datetime: { [older ? Op.lte : Op.gte]: start }
      }
    }

    // include recurrent events?
    if (!show_recurrent) {
      where.parentId = null
    }

    if (!show_multidate) {
      where.multidate = { [Op.not]: true }
    }

    if (end) {
      where.start_datetime = { [older ? Op.gte : Op.lte]: end }
    }

    // normalize tags
    if (tags) {
      tags = tags.split(',').map(t => t.trim().toLocaleLowerCase())
    }

    const replacements = []
    if (tags && places) {
      where[Op.and] = [
        { placeId: places ? places.split(',') : [] },
        Sequelize.fn('EXISTS', Sequelize.literal(`SELECT 1 FROM event_tags WHERE ${Col('event_tags.eventId')}=${Col('event.id')} AND LOWER(${Col('tagTag')}) in (?)`))
      ]
      replacements.push(tags)
    } else if (tags) {
      where[Op.and] = Sequelize.fn('EXISTS', Sequelize.literal(`SELECT 1 FROM event_tags WHERE ${Col('event_tags.eventId')}=${Col('event.id')} AND LOWER(${Col('tagTag')}) in (?)`))
      replacements.push(tags)
    } else if (places) {
      where.placeId = places.split(',')
    }

    if (query) {
      replacements.push(query)
      where[Op.or] =
        [
          { title: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + query + '%') },
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + query + '%'),
          Sequelize.fn('EXISTS', Sequelize.literal(`SELECT 1 FROM event_tags WHERE ${Col('event_tags.eventId')}=${Col('event.id')} AND LOWER(${Col('tagTag')}) = ?`))
        ]
    }
    
    let pagination = {}
    if (limit) {
      pagination = {
        limit,
        offset: limit * page,
      }
    }

    const events = await Event.findAll({
      where,
      attributes: {
        exclude: ['likes', 'boost', 'userId', 'is_visible', 'createdAt', 'description', 'resources', 'recurrent', 'placeId', 'image_path']
      },
      order: [['start_datetime', reverse ? 'DESC' : 'ASC']],
      include: [
        {
          model: Tag,
          // order: [Sequelize.literal('(SELECT COUNT(tagTag) FROM event_tags WHERE tagTag = tag) DESC')],
          attributes: ['tag'],
          through: { attributes: [] }
        },
        { model: Place, required: true, attributes: ['id', 'name', 'address', 'latitude', 'longitude'] }
      ],
      ...pagination,
      replacements
    }).catch(e => {
      log.error('[EVENT]' + String(e))
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
  async select(req, res) {
    const settings = res.locals.settings
    const start = req.query.start || DateTime.local().toUnixInteger()
    const end = req.query.end
    const query = req.query.query
    const tags = req.query.tags
    const places = req.query.places
    const limit = Number(req.query.max) || 0
    const page = Number(req.query.page) || 0
    const older = req.query.older || false

    const show_multidate = settings.allow_multidate_event &&
    typeof req.query.show_multidate !== 'undefined' ? req.query.show_multidate !== 'false' : true

    const show_recurrent = settings.allow_recurrent_event &&
      typeof req.query.show_recurrent !== 'undefined' ? req.query.show_recurrent === 'true' : settings.recurrent_event_visible

    res.json(await eventController._select({
      start, end, query, places, tags, show_recurrent, show_multidate, limit, page, older
    }))
  },

  /**
   * Ensure we have the next occurrence of a recurrent event
   */
  async _createRecurrentOccurrence(e, startAt = DateTime.local(), firstOccurrence = true) {
    log.debug(`Create recurrent event [${e.id}] ${e.title}"`)

    // prepare the new event occurrence copying the parent's properties
    const event = {
      parentId: e.id,
      title: e.title,
      description: e.description,
      media: e.media,
      is_visible: true,
      userId: e.userId,
      placeId: e.placeId
    }

    const recurrentDetails = e.recurrent
    const parentStartDatetime = DateTime.fromSeconds(e.start_datetime)

    // cursor is when start to count
    // sets it to 
    let cursor = parentStartDatetime > startAt ? parentStartDatetime : startAt
    startAt = cursor

    const duration = e.end_datetime ? e.end_datetime-e.start_datetime : 0
    const frequency = recurrentDetails.frequency
    const type = recurrentDetails.type
    if (!frequency) {
      log.warn(`Recurrent event ${e.id} - ${e.title} does not have a frequency specified`)
      return
    }

    cursor = cursor.set({ hour: parentStartDatetime.hour, minute: parentStartDatetime.minute, second: 0 })

    // each week or 2
    if (frequency[1] === 'w') {
      cursor = cursor.set({ weekday: parentStartDatetime.weekday }) //day(parentStartDatetime.day())
      if (cursor < startAt) {
        cursor = cursor.plus({ days: 7 * Number(frequency[0]) })
      }
    } else if (frequency === '1m') {
      if (type === 'ordinal') {
        cursor = cursor.set({ day: parentStartDatetime.day })

        if (cursor< startAt) {
          cursor = cursor.plus({ months: 1 })
        }
      } else { // weekday
        // get weekday
        // get recurrent freq details
        cursor = helpers.getWeekdayN(cursor, type, parentStartDatetime.weekday)
        if (cursor< startAt) {
          cursor = cursor.plus({ months: 1 })
          cursor = helpers.getWeekdayN(cursor, type, parentStartDatetime.weekday)
        }
      }
    }
    log.debug(cursor)
    event.start_datetime = cursor.toUnixInteger()
    event.end_datetime = e.end_datetime ? event.start_datetime + duration : null
    try {
      const newEvent = await Event.create(event)
      if (e.tags) {
        return newEvent.addTags(e.tags)
      } else {
        return newEvent
      }
    } catch (e) {
      console.error(event)
      log.error('[RECURRENT EVENT]', e)
    }
  },

  /**
   * Create instances of recurrent events
   */
  async _createRecurrent(start_datetime = DateTime.local().toUnixInteger()) {
    // select recurrent events and its childs
    const events = await Event.findAll({
      where: { is_visible: true, recurrent: { [Op.ne]: null } },
      include: [{ model: Tag, required: false },
      { model: Event, as: 'child', required: false, where: { start_datetime: { [Op.gte]: start_datetime } } }],
      order: [['child', 'start_datetime', 'DESC']]
    })

    // create a new occurrence for each recurring events but the one's that has an already visible occurrence coming
    const creations = events.map(e => {
      if (e.child.length) {
        if (e.child.find(c => c.is_visible)) return
        return eventController._createRecurrentOccurrence(e, DateTime.fromSeconds(e.child[0].start_datetime + 1), false)
      }
      return eventController._createRecurrentOccurrence(e, DateTime.local(), true)
    })

    return Promise.all(creations)
  }
}

module.exports = eventController
