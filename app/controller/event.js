const { User, Event, Comment, Tag, Place, Reminder } = require('../model')
const moment = require('moment')
const { Op } = require('sequelize')
const lodash = require('lodash')
const eventController = {

  async addComment (req, res) {
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

  async getMeta (req, res) {
    console.log('GET META')
    const places = await Place.findAll()
    const tags = await Tag.findAll()
    res.json({ tags, places })
  },

  async getReminders (event) {
    function match (event, filters) {
      // matches if no filter specified
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
    const reminders = await Reminder.findAll()

    // get reminder that matches with selected event
    return reminders.filter(reminder => match(event, reminder.filters))
  },

  async updateTag (req, res) {
    const tag = await Tag.findByPk(req.body.tag)
    console.log(tag)
    if (tag) {
      res.json(await tag.update(req.body))
    } else {
      res.send(404)
    }
  },

  async updatePlace (req, res) {
    const place = await Place.findByPk(req.body.id)
    await place.update(req.body)
    res.json(place)
  },

  async get (req, res) {
    const id = req.params.event_id
    const event = await Event.findByPk(id, { include: [User, Tag, Comment, Place] })
    res.json(event)
  },

  async confirm (req, res) {
    const id = req.params.event_id
    const event = await Event.findByPk(id)
    try {
      await event.update({ is_visible: true })
      res.send(200)
    } catch (e) {
      res.send(404)
    }
  },

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

  async addReminder (req, res) {
    try {
      await Reminder.create(req.body)
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(404)
    }
  },
  async getAll (req, res) {
    const start = moment().year(req.params.year).month(req.params.month).startOf('month').subtract(1, 'week')
    const end = moment().year(req.params.year).month(req.params.month).endOf('month').add(1, 'week')
    const events = await Event.findAll({
      where: {
        is_visible: true,
        [Op.and]: [
          { start_datetime: { [Op.gte]: start } },
          { start_datetime: { [Op.lte]: end } }
        ]
      },
      order: [['start_datetime', 'ASC']],
      include: [User, Comment, Tag, Place]
    })
    res.json(events)
  }

}

module.exports = eventController
