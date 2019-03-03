const { User, Event, Comment, Tag, Place } = require('../model')
const moment = require('moment')
const Sequelize = require('sequelize')

const eventController = {

  async addComment (req, res) {
    // comment could be added to an event or to another comment
    let event = await Event.findOne({ where: { activitypub_id: req.body.id } })
    if (!event) {
      const comment = await Comment.findOne({ where: { activitypub_id: req.body.id }, include: Event })
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
    console.log(place)
    await place.update(req.body)
    res.json(place)
  },
  async get (req, res) {
    const id = req.params.event_id
    const event = await Event.findByPk(id, { include: [User, Tag, Comment, Place] })
    res.json(event)
  },

  async getAll (req, res) {
    const start = moment().year(req.params.year).month(req.params.month).startOf('month').subtract(1, 'week')
    const end = moment().year(req.params.year).month(req.params.month).endOf('month').add(1, 'week')
    const events = await Event.findAll({
      where: {
        [Sequelize.Op.and]: [
          { start_datetime: { [Sequelize.Op.gte]: start } },
          { start_datetime: { [Sequelize.Op.lte]: end } }
        ]
      },
      order: [['start_datetime', 'ASC']],
      include: [User, Comment, Tag, Place]
    })
    res.json(events)
  }

}

module.exports = eventController
