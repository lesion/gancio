const { Tag, Event } = require('../models/models')
const { sequelize } = require('../models/index')
const { uniqBy, toLower } = require('lodash')
const log = require('../../log')
const Sequelize = require('sequelize')
const { col: escapeCol } = require('../../helpers')
const { fn, col, Op } = require('sequelize')
const exportController = require('./export')

module.exports = {

  async _findOrCreate (tags) {
    // trim tags
    const trimmedTags = tags?.map(t => t.trim())

    // search for already existing tags (case insensitive, note that LOWER sql function is not the same as toLocaleLowerCase due to #329)
    const existingTags = await sequelize.query(`SELECT * FROM ${escapeCol('tags')} where LOWER(${escapeCol('tag')}) in (${tags.map(t => 'LOWER(?)').join(',')})`,
      { model: Tag, mapToModel: true, replacements: trimmedTags, type: Sequelize.QueryTypes.SELECT })
    const lowercaseExistingTags = existingTags.map(t => t.tag.toLocaleLowerCase())

    const remainingTags = uniqBy(trimmedTags.filter(t => ! lowercaseExistingTags.includes(t.toLocaleLowerCase())), toLower)

    // create remaining tags and return all
    return [].concat(
      existingTags,
      await Tag.bulkCreate(remainingTags.map(t => ({ tag: t })))
    )
  },

  // /feed/rss/tag/:tag
  // /feed/ics/tag/:tag
  // /feed/json/tag/:tag
  // tag/:tag
  async getEvents (req, res) {
    const eventController = require('./event')
    const format = req.params.format || 'json'
    const tag = req.params.tag

    // check if this tag exists
    if(!await Tag.findOne({ where: { tag } })) {
      return res.sendStatus(404)
    }
    const events = await eventController._select({ tags: tag, show_recurrent: true, show_multidate: true, start: 0, reverse: true, include_description: true })
    switch (format) {
      case 'rss':
        return exportController.feed(req, res, events,
            `${res.locals.settings.title} - Tag #${tag}`,
            `${res.locals.settings.baseurl}/feed/rss/tag/${tag}`)
      case 'ics':
        return exportController.ics(req, res, events)
      default:
        return res.json(events)
    }
  },



  async getAll (_req, res) {
    const tags = await Tag.findAll({
      order: [[fn('COUNT', col('tag.tag')), 'DESC']],
      attributes: ['tag', [fn('COUNT', col('tag.tag')), 'count']],
      include: [{ model: Event, where: { is_visible: true }, attributes: [], through: { attributes: [] }, required: true }],
      group: ['tag.tag'],
      raw: true,
    })
    return res.json(tags)
  },


  /**
   * search for tags by query string
   * sorted by usage
  */
  async search (req, res) {
    const search = req?.query?.search
    let where = { }
    if (search) {
      where = { tag: { [Op.like]: `%${search}%` } }
    }
    const tags = await Tag.findAll({
      order: [[fn('COUNT', col('tag.tag')), 'DESC']],
      attributes: ['tag'],
      where,
      include: [{ model: Event, where: { is_visible: true }, attributes: [], through: { attributes: [] }, required: true }],
      group: ['tag.tag'],
      limit: 10,
      raw: true,
      subQuery: false
    })

    return res.json(tags.map(t => t.tag))
  },

  // async updateTag (req, res) {
  //   const tag = await Tag.findByPk(req.body.tag)
  //   await tag.update(req.body)
  //   res.json(place)
  // },

  async updateTag (req, res) {
    try {
      const oldtag = await Tag.findByPk(req.body.tag)
      const newtag = await Tag.findByPk(req.body.newTag)

      // if the new tag does not exists, just rename the old one
      if (!newtag) {
        log.info(`Rename tag "${oldtag.tag}" to "${req.body.newTag}"`)
        await Tag.update({ tag: req.body.newTag }, { where: { tag: req.body.tag }, raw: true })

      } else {
        // in case it exists:
        // - search for events with old tag
        const events = await oldtag.getEvents()
        // - substitute it with the new one
        await oldtag.removeEvents(events)
        await newtag.addEvents(events)
      }
      res.sendStatus(200)
    } catch (e) {
      console.error(e)
      res.sendStatus(400)
    }
  },

  async remove (req, res) {
    log.info('Remove tag', req.params.tag)
    const tagName = req.params.tag
    try {
      const tag = await Tag.findByPk(tagName)
      await tag.destroy()
      res.sendStatus(200)
    } catch (e) {
      log.error('Tag removal failed:', e)
      res.sendStatus(404)
    }
  }

}
