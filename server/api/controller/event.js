const crypto = require('crypto')
const moment = require('moment')
const { Op } = require('sequelize')
const lodash = require('lodash')
const { event: Event, comment: Comment, tag: Tag, place: Place, notification: Notification } = require('../models')
const Sequelize = require('sequelize')
const notifier = require('../../notifier')

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
        include: [[Sequelize.fn('count', Sequelize.col('events.placeId')) , 'weigth']],
        exclude: ['weigth', 'createdAt', 'updatedAt']
      },
      include: [{ model: Event, attributes: [] }],
      group: ['place.id']
    })

    const tags = await Tag.findAll({
      order: [['weigth', 'DESC']],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
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

  // TODO retrieve next/prev event also
  // select id, start_datetime, title from events where start_datetime > (select start_datetime from events where id=89) order by start_datetime limit 20;
  async get(req, res) {
    const is_admin = req.user && req.user.is_admin
    const id = req.params.event_id
    let event = await Event.findByPk(id, {
      plain: true,
      attributes: { 
        exclude: ['createdAt', 'updatedAt']
      },
      include: [
        { model: Tag, attributes: ['tag', 'weigth'], through: { attributes: [] } },
        { model: Place, attributes: ['name', 'address'] },
        Comment
      ],
      order: [ [Comment, 'id', 'DESC'] ]
    })

    // event.start_datetime = event.start_datetime*1000
    // event.end_datetime = event.end_datetime*1000

    if (event && (event.is_visible || is_admin)) {
      res.json(event)
    } else {
      res.sendStatus(404)
    }
  },

  async confirm(req, res) {
    const id = Number(req.params.event_id)
    const event = await Event.findByPk(id)
    if (!event) return res.sendStatus(404)

    try {
      event.is_visible = true
      await event.save()

      res.sendStatus(200)
      
      // send notification
      notifier.notifyEvent(event.id)
    } catch (e) {
      res.sendStatus(404)
    }
  },

  async unconfirm(req, res) {
    const id = Number(req.params.event_id)
    const event = await Event.findByPk(id)
    if (!event) return sendStatus(404)

    try {
      event.is_visible = false
      await event.save()
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
    if (shownDays <= 35) end = end.add(1, 'week')
    end = end.endOf('week')

    let events = await Event.findAll({
      where: {
        // return only confirmed events
        is_visible: true,
        [Op.or]: [
          // return all recurrent events
          {recurrent: { [Op.ne]: null }},

          // and events in specified range
          { start_datetime: { [Op.between]: [start.unix(), end.unix()] }}
        ]
      },
      attributes: { exclude: ['createdAt', 'updatedAt', 'placeId' ] },
      order: [[Tag, 'weigth', 'DESC']],
      include: [
        { model: Tag, required: false },
        { model: Place, required: false, attributes: ['id', 'name', 'address'] }
      ]
    })

    events = events.map(e => e.get()).map(e => {
      e.start_datetime = e.start_datetime*1000
      e.end_datetime = e.end_datetime*1000
      e.tags = e.tags.map(t => t.tag)
      return e
    })

    // build singular events from a recurrent pattern
    function createEventsFromRecurrent(e, dueTo=null) {
      const events = []
      const recurrent = JSON.parse(e.recurrent)
      if (!recurrent.frequency) return false

      let cursor = moment(start).startOf('week')
      const start_date = moment(e.start_datetime)
      const duration = moment(e.end_datetime).diff(start_date, 's')
      const frequency = recurrent.frequency
      const days = recurrent.days
      const type = recurrent.type

      // default frequency is '1d' => each day
      const toAdd = { n: 1, unit: 'day'}
      cursor.set('hour', start_date.hour()).set('minute', start_date.minutes())

      // each week or 2 (search for the first specified day)
      if (frequency === '1w' || frequency === '2w') {
        cursor.add(days[0]-1, 'day')
        if (frequency === '2w') {
          const nWeeks = cursor.diff(e.start_datetime, 'w')%2
          if (!nWeeks) cursor.add(1, 'week')
        }
        toAdd.n = Number(frequency[0])
        toAdd.unit = 'week';
        // cursor.set('hour', start_date.hour()).set('minute', start_date.minutes())
      }

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
        let first_event_of_week = cursor.clone()
        days.forEach(d => {
          if (type === 'ordinal') {
            cursor.date(d)
          } else {
            cursor.day(d-1)
          }
          if (cursor.isAfter(dueTo) || cursor.isBefore(start)) return
          e.start_datetime = cursor.unix()*1000
          e.end_datetime = e.start_datetime+(duration*1000)// cursor.clone().hour(end_datetime.hour()).minute(end_datetime.minute()).unix()*1000
          events.push( Object.assign({}, e) )
        })        
        if (cursor.isAfter(dueTo)) break
        cursor = first_event_of_week.add(toAdd.n, toAdd.unit)
      }


      return events
    }

    let allEvents = events.filter(e => !e.recurrent)
    events.filter(e => e.recurrent).forEach(e => {
      const events = createEventsFromRecurrent(e, end)
      if (events)
        allEvents = allEvents.concat(events)
    })

    // allEvents.sort((a,b) => a.start_datetime-b.start_datetime)
    res.json(allEvents.sort((a,b) => a.start_datetime-b.start_datetime))
  }

}

module.exports = eventController
