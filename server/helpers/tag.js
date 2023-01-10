const { Event, Tag } = require('../api/models/models')

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
    log.info(`Remove ${tags.length} orphan tags (${tags.join(', ')})`)

    await Tag.destroy({
      where: { tag: { [Sequelize.Op.in]: tags.map(p => p.tag) } }
    })
  }
}
