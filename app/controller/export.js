const jwt = require('jsonwebtoken')
const { User, Event, Comment, Tag, Place } = require('../model')
const config = require('../config')
const mail = require('../mail')
const moment = require('moment')
const Sequelize = require('sequelize')
const ics = require('ics')

const exportController = {
  async getAll (req, res) {
    const events = await Event.findAll({
      where: {
        [Sequelize.Op.and]: [
          { start_datetime: { [Sequelize.Op.gte]: start } },
          { start_datetime: { [Sequelize.Op.lte]: end } }
        ]
      },
      order: [['createdAt', 'DESC']],
      include: [User, Comment, Tag, Place]
    })
    res.json(events)
  },
  async feed (req, res) {
    const events = await Event.findAll({include: [Comment, Tag, Place]})
    res.type('application/rss+xml; charset=UTF-8')
    res.render('feed/rss.pug', {events, config, moment})
  },
  async ics (req, res) {
    const events = await Event.findAll({include: [Comment, Tag, Place]})
    console.log(events)
    const eventsMap = events.map(e => ({
      start: [2019, 2, 2],
      end: [2019, 2, 3],
      title: e.title,
      description: e.description,
      location: e.place.name
    }))
    res.type('text/calendar; charset=UTF-8')
    const { error, value } = ics.createEvents(eventsMap)
    console.log(value)
    res.send(value)
  }
}

module.exports = exportController
