const { Collection, Filter, Event, Tag, Place, APUser } = require('../models/models')

const log = require('../../log')
const { DateTime } = require('luxon')
const { col: Col, queryParamToBool } = require('../../helpers')
const { Op, Sequelize } = require('sequelize')

const collectionController = {

  // get all collections
  async getAll (req, res) {
    const withFilters = queryParamToBool(req.query.withFilters)
    const pin = req.query.pin
    let collections
    if (withFilters) {
      collections = await Collection.findAll({ include: [ Filter ] })
    } else {
      if (pin) {
        collections = await Collection.findAll({ where: { isTop: true }})
      } else {
        collections = await Collection.findAll()
      }
    }

    return res.json(collections)
  },


  async togglePin (req, res) {
    const id = req.params.id
    try {
      const collection = await Collection.findByPk(id)
      if (!collection) { return req.sendStatus(404) }
      await collection.update({ isTop: !collection.isTop })
      res.json(!collection.isTop)
    } catch (e) {
      log.error(e)
      res.sendStatus(404)
    }
  },

  async getEvents (req, res) {
    const exportController = require('./export')
    const format = req.params.format || 'json'
    const name = req.params.name
    const limit = req.query.max || 10
    const start = req.query.start_at || DateTime.local().toUnixInteger()

    try {
      const events = await collectionController._getEvents({ name, start, limit })
      log.debug(`[COLLECTION] (${name}) events: ${events?.length}`)

      switch (format) {
        case 'rss':
          return exportController.feed(req, res, events,
              `${res.locals.settings.title} - Collection @${name}`,
              `${res.locals.settings.baseurl}/feed/rss/collection/${name}`)
        case 'ics':
          return exportController.ics(req, res, events)
        default:
          return res.json(events)
      }
    } catch (e) {
      log.warn('[COLLECTION] getEvents: %s', String(e))
      return res.sendStatus(404)
    }
  },

  // return events from collection
  async _getEvents ({ name, start, end, limit, include_description=false, older, reverse }) {

    const collection = await Collection.findOne({ where: { name } })
    if (!collection) {
      throw new Error(`Collection ${name} not found`)
    }

    const filters = await Filter.findAll({ where: { collectionId: collection.id } })

    // collection is empty if there are no filters
    if (!filters.length) {
      return []
    }

    // init stardard filter
    const where = {
      // do not include parent recurrent event
      recurrent: null,

      // confirmed event only
      is_visible: true,
      [Op.or]: {
        start_datetime: { [older ? Op.lte : Op.gte]: start },
        end_datetime: { [older ? Op.lte : Op.gte]: start }
      }
    }

    if (end) {
      where.start_datetime = { [older ? Op.gte : Op.lte]: end }
    }

    const replacements = []
    const ors = []

    // collections are a set of filters to match
    filters.forEach(f => {

      let conditions = []

      if (f.tags && f.tags.length) {
        const tags = Sequelize.fn('EXISTS', Sequelize.literal(`SELECT 1 FROM event_tags WHERE ${Col('event_tags.eventId')}=event.id AND ${Col('tagTag')} in (?)`))
        replacements.push(f.tags)
        conditions.push(tags)
      }

      if (f.places && f.places.length) {
          conditions.push({ placeId: f.places.map(p => p.id) })
      }
      
      if (f.actors && f.actors.length) {
        conditions.push({ apUserApId: f.actors.map(a => a.ap_id)})
      }

      if (!conditions.length) return
      ors.push(conditions.length === 1 ? conditions[0] : { [Op.and]: conditions })
    })

    where[Op.and] = { [Op.or]: ors }

    const events = await Event.findAll({
      where,
      attributes: {
        exclude: ['likes', 'boost', 'userId', 'is_visible', 'createdAt', 'resources', 'ap_id', ...(!include_description ? ['description'] : [])]
      },
      order: [['start_datetime', reverse ? 'DESC' : 'ASC']],
      include: [
        {
          model: Tag,
          // order: [Sequelize.literal('(SELECT COUNT("tagTag") FROM event_tags WHERE tagTag = tag) DESC')],
          attributes: ['tag'],
          through: { attributes: [] }
        },
        { model: Place, required: true, attributes: ['id', 'name', 'address'] },
      ],
      ...( limit && { limit }),
      replacements
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

  async add (req, res) {
    const collectionDetail = {
      name: req.body.name,
      isActor: true,
      isTop: true
    }

    // TODO: validation
    log.info(`Create collection: ${req.body.name}`)
    try {
      const collection = await Collection.create(collectionDetail)
      res.json(collection)
    } catch (e) {
      log.error(`Create collection failed ${e}`)
      res.status(400).send(e)
    }
  },

  async remove (req, res) {
    const collection_id = req.params.id
    log.info('Remove collection', collection_id)
    try {
      const collection = await Collection.findByPk(collection_id)
      await collection.destroy()
      res.sendStatus(200)
    } catch (e) {
      log.error('Remove collection failed:' + String(e))
      res.sendStatus(404)
    }
  },

  async getFilters (req, res) {
    const collectionId = req.params.collection_id
    const filters = await Filter.findAll({ where: { collectionId } })
    return res.json(filters)
  },

  async addFilter (req, res) {
    const { collectionId, tags, places, actors } = req.body

    try {
      // if (actors?.length) {
      //   const actors_to_follow = await APUser.findAll({ where: { ap_id: { [Op.in]: actors.map(a => a.ap_id) }} })
      //   await Promise.all(actors_to_follow.map(followActor))
      // }
      const filter = await Filter.create({ collectionId, tags, places, actors })
      return res.json(filter)
    } catch (e) {
      log.error(String(e))
      return res.sendStatus(400)
    }
  },

  async removeFilter (req, res) {
    const filter_id = req.params.id
    log.info(`Remove filter ${filter_id}`)
    try {
      const filter = await Filter.findByPk(filter_id)
      if (!filter) {
        return res.sendStatus(404)
      }
      await filter.destroy()
      res.sendStatus(200)
    } catch (e) {
      log.error('Remove filter failed:', e)
      res.sendStatus(404)
    }
  },



}

module.exports = collectionController
