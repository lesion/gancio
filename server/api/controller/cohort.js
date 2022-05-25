const Cohort = require('../models/cohort')
const Filter = require('../models/filter')
const Event = require('../models/event')
const Tag = require('../models/tag')
const Place = require('../models/place')
const log = require('../../log')
const dayjs = require('dayjs')

// const { sequelize } = require('../models/index')


const { Op, Sequelize } = require('sequelize')

const cohortController = {

  async getAll (req, res) {
    const withFilters = req.query.withFilters
    let cohorts
    if (withFilters) {
      cohorts = await Cohort.findAll({ include: [Filter] })

    } else {
      cohorts = await Cohort.findAll()
    }

    return res.json(cohorts)
  },

  // return events from cohort
  async getEvents (req, res) {
    const name = req.params.name

    const cohort = await Cohort.findOne({ where: { name } })
    if (!cohort) { 
      return res.sendStatus(404)
    }
    const filters = await Filter.findAll({ where: { cohortId: cohort.id } })

    const start = dayjs().unix()
    const where = {
      // do not include parent recurrent event
      recurrent: null,

      // confirmed event only
      is_visible: true,

      // [Op.or]: {
      start_datetime: { [Op.gte]: start },
        // end_datetime: { [Op.gte]: start }
      // }
    }

    // if (!show_recurrent) {
    //   where.parentId = null
    // }

    // if (end) {
    //   where.start_datetime = { [Op.lte]: end }
    // }

    const replacements = []
    const ors = []
    filters.forEach(f => {
      if (f.tags && f.tags.length) {
        const tags = Sequelize.fn('EXISTS', Sequelize.literal('SELECT 1 FROM event_tags WHERE "event_tags"."eventId"="event".id AND "tagTag" in (?)'))
        replacements.push(f.tags)
        if (f.places && f.places.length) {
          ors.push({ [Op.and]: [ { placeId: f.places.map(p => p.id) },tags] })
        } else {
          ors.push(tags)
        }
      } else if (f.places && f.places.length) {
        ors.push({ placeId: f.places.map(p => p.id) })
      }
    })

    // if (tags && places) {
    //   where[Op.or] = {
    //     placeId: places ? places.split(',') : [],
    //     // '$tags.tag$': Sequelize.literal(`EXISTS (SELECT 1 FROM event_tags WHERE tagTag in ( ${Sequelize.QueryInterface.escape(tags)} ) )`)
    //   }
    // } else if (tags) {
    //   where[Op.and] = Sequelize.literal(`EXISTS (SELECT 1 FROM event_tags WHERE event_tags.eventId=event.id AND tagTag in (?))`)
    //   replacements.push(tags)
    // } else if (places) {
    //   where.placeId = places.split(',')
    // }

    if (ors.length) {
      where[Op.or] = ors
    }

    const events = await Event.findAll({
      logging: console.log,
      where,
      attributes: {
        exclude: ['likes', 'boost', 'userId', 'is_visible', 'createdAt', 'updatedAt', 'description', 'resources']
      },
      order: ['start_datetime'],
      include: [
        // { model: Resource, required: false, attributes: ['id'] },
        {
          model: Tag,
          order: [Sequelize.literal('(SELECT COUNT("tagTag") FROM event_tags WHERE tagTag = tag) DESC')],
          attributes: ['tag'],
          through: { attributes: [] }
        },
        { model: Place, required: true, attributes: ['id', 'name', 'address'] }
      ],
      // limit: max,
      replacements
    }).catch(e => {
      log.error('[EVENT]', e)
      return []
    })

    const ret  = events.map(e => {
      e = e.get()
      e.tags = e.tags ? e.tags.map(t => t && t.tag) : []
      return e
    })

    return res.json(ret)

  },

  async add (req, res) {
    const cohortDetail = {
      name: req.body.name,
      isActor: true,
      isTop: true
    }

    // TODO: validation
    log.info('Create cohort: ' + req.body.name)
    const cohort = await Cohort.create(cohortDetail)
    res.json(cohort)
  },

  async remove (req, res) {
    const cohort_id = req.params.id
    log.info('Remove cohort', cohort_id)
    try {
      const cohort = await Cohort.findByPk(cohort_id)
      await cohort.destroy()
      res.sendStatus(200)
    } catch (e) {
      log.error('Remove cohort failed:', e)
      res.sendStatus(404)
    }
  },

  async getFilters (req, res) {
    const cohortId = req.params.cohort_id
    const filters = await Filter.findAll({ where: { cohortId } })
    return res.json(filters)
  }, 

  async addFilter (req, res) {
    const cohortId = req.body.cohortId
    const tags = req.body.tags
    const places = req.body.places
    try {
      const filter = await Filter.create({ cohortId, tags, places })
      return res.json(filter)
    } catch (e) {
      log.error(String(e))
      return res.status(500)
    }
  },

  async removeFilter (req, res) {
    const filter_id = req.params.id
    log.info('Remove filter', filter_id)
    try {
      const filter = await Filter.findByPk(filter_id)
      await filter.destroy()
      res.sendStatus(200)
    } catch (e) {
      log.error('Remove filter failed:', e)
      res.sendStatus(404)
    }
  },



}



module.exports = cohortController