const Tag = require('../api/models/tag')
const Event = require('../api/models/event')
const Sequelize = require('sequelize')
const log = require('../log')

module.exports = {
  // remove tags not related to any events
  async _cleanUnused () {
    const tags = await Tag.findAll({
      include: [{ model: Event, as: 'events', required: false, attributes: [], through: { attributes: [] } }],
      group: ['tag.tag'],
      having: Sequelize.where(Sequelize.fn('COUNT', Sequelize.col('events.id')), '=', 0)
    })

    if (!tags.length) { return }
    log.info(`Remove ${tags.length} unrelated tags`)

    await Tag.destroy({
      where: { tag: { [Sequelize.Op.in]: tags.map(p => p.tag) } }
    })
  }
}
