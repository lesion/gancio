const crypto = require('crypto')
const moment = require('moment')
const { Op } = require('sequelize')
const lodash = require('lodash')
const { event: Event, comment: Comment, tag: Tag, place: Place, notification: Notification } = require('../models')
const Sequelize = require('sequelize')

const eventController = {

  async addComment(req, res) {
    // comment could be added to an event or to another comment
    let event = await Event.findOne({ where: { activitypub_id: { [Op.eq]: req.body.id } } })
    if (!event) {
      const comment = await Comment.findOne({ where: { activitypub_id: { [Op.eq]: req.body.id } }, include: Event })
      event = comment.event
    }
    const comment = new Comment(req.body)
    event.addComment(comment)
    res.json(comment)
  },

  async getMeta(req, res) {
    const places = await Place.findAll({
      order: [[Sequelize.literal('weigth'), 'DESC']],
      attributes: {
        include: [[Sequelize.fn('count', Sequelize.col('events.placeId')) , 'weigth']], // <---- Here you will get the total count of user
        exclude: ['weigth', 'createdAt', 'updatedAt']
      },
      include: [{ model: Event, attributes: [] }],
      group: ['place.id']
    })

    const tags = await Tag.findAll({
      order: [['weigth', 'DESC']],
      includeIgnoreAttributes: false,
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    })

    res.json({ tags, places })
  },

  async getNotifications(event) {
    function match(event, filters) {
      // matches if no filter specified
      if (!filters) return true

      // check for visibility
      if (typeof filters.is_visible !== 'undefined' && filters.is_visible !== event.is_visible) return false

      if (!filters.tags && !filters.places) return true
      if (!filters.tags.length && !filters.places.length) return true
      if (filters.tags.length) {
        const m = lodash.intersection(event.tags.map(t => t.tag), filters.tags)
        if (m.length > 0) return true
      }
      if (filters.places.length) {
        if (filters.places.find(p => p === event.place.name)) {
          return true
        }
      }
    }
    const notifications = await Notification.findAll()

    // get notification that matches with selected event
    return notifications.filter(notification => match(event, notification.filters))
  },

  async updateTag(req, res) {
    const tag = await Tag.findByPk(req.body.tag)
    if (tag) {
      res.json(await tag.update(req.body))
    } else {
      res.sendStatus(404)
    }
  },

  async updatePlace(req, res) {
    const place = await Place.findByPk(req.body.id)
    await place.update(req.body)
    res.json(place)
  },

  async get(req, res) {
    const id = req.params.event_id
    const event = await Event.findByPk(id, { include:
      [
        Tag,
        Comment,
        { model: Place, attributes: ['name', 'address'] }
      ],
    order: [ [Comment, 'id', 'DESC'], [Tag, 'weigth', 'DESC'] ]
    })
    res.json(event)
  },

  async confirm(req, res) {
    const id = req.params.event_id
    const event = await Event.findByPk(id)

    try {
      await event.update({ is_visible: true })
      // insert notification
      const notifications = await eventController.getNotifications(event)
      await event.setNotifications(notifications)
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(404)
    }
  },

  async unconfirm(req, res) {
    const id = req.params.event_id
    const event = await Event.findByPk(id)

    try {
      await event.update({ is_visible: false })
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(404)
    }
  },

  async getUnconfirmed(req, res) {
    const events = await Event.findAll({
      where: {
        is_visible: false
      },
      order: [['start_datetime', 'ASC']],
      include: [Tag, Place]
    })
    res.json(events)
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
      const notification = await Notification.findOne({ where: { remove_code: { [Op.eq]: remove_code } } })
      await notification.destroy()
    } catch (e) {
      return res.sendStatus(404)
    }
    res.sendStatus(200)
  },

  async getAll(req, res) {
    // this is due how v-calendar shows dates
    const start = moment().year(req.params.year).month(req.params.month)
      .startOf('month').startOf('isoWeek')
    let end = moment().year(req.params.year).month(req.params.month).endOf('month')
    const shownDays = end.diff(start, 'days')
    if (shownDays <= 34) end = end.add(1, 'week')
    end = end.endOf('isoWeek')
    const events = await Event.findAll({
      where: {
        is_visible: true,
        [Op.and]: [
          { start_datetime: { [Op.gte]: start } },
          { start_datetime: { [Op.lte]: end } }
        ]
      },
      order: [
        ['start_datetime', 'ASC'],
        [Tag, 'weigth', 'DESC']
      ],
      include: [
        // { model: User, required: false },
        // { type: Comment, required: false, attributes: ['']
        { model: Tag, required: false, attributes: ['tag', 'weigth', 'color'] },
        { model: Place, required: false, attributes: ['id', 'name', 'address'] }
      ]
    })
    res.json(events)
  }

}

module.exports = eventController
