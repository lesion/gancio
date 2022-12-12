const Tag = require('../models/tag')
const Event = require('../models/event')
const uniq = require('lodash/uniq')
const log = require('../../log')


const { where, fn, col, Op } = require('sequelize')
const exportController = require('./export')

module.exports = {

  async _findOrCreate (tags) {
    // trim tags
    const trimmedTags = tags.map(t => t.trim())
    const lowercaseTags = trimmedTags.map(t => t.toLocaleLowerCase())

    // search for already existing tags (tag is the same as TaG)
    const existingTags = await Tag.findAll({ where: { [Op.and]: where(fn('LOWER', col('tag')), { [Op.in]: lowercaseTags }) } })
    const lowercaseExistingTags = existingTags.map(t => t.tag.toLocaleLowerCase())
    const remainingTags = uniq(trimmedTags.filter(t => ! lowercaseExistingTags.includes(t.toLocaleLowerCase())))

    // create remaining tags (cannot use updateOnDuplicate or manage conflicts)
    return [].concat(
      existingTags,
      await Tag.bulkCreate(remainingTags.map(t => ({ tag: t })))
    )
  },

  // /feed/rss/tag/:tagname
  // /feed/ics/tag/:tagname
  // /feed/json/tag/:tagname
  // tag/:tag
  async getEvents (req, res) {
    const eventController = require('./event')
    const format = req.params.format || 'json'
    const tags = req.params.tag
    const events = await eventController._select({ tags: tags.toLocaleLowerCase(), show_recurrent: true })
    switch (format) {
      case 'rss':
        return exportController.feed(req, res, events,
            `${res.locals.settings.title} - Tag #${tags}`,
            `${res.locals.settings.baseurl}/feed/rss/tag/${tags}`)
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
    const search = req.query.search
    const tags = await Tag.findAll({
      order: [[fn('COUNT', col('tag.tag')), 'DESC']],
      attributes: ['tag'],
      where: {
        tag: where(fn('LOWER', col('tag')), 'LIKE', '%' + search + '%'),
      },
      include: [{ model: Event, where: { is_visible: true }, attributes: [], through: { attributes: [] }, required: true }],
      group: ['tag.tag'],
      limit: 10,
      subQuery: false
    })

    return res.json(tags.map(t => t.tag))
  },

  async updateTag (req, res) {
    const tag = await Tag.findByPk(req.body.tag)
    await tag.update(req.body)
    res.json(place)
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