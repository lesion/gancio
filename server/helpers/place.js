const { Event, Place } = require('../api/models/models')
const Sequelize = require('sequelize')
const log = require('../log')

module.exports = {
  // remove places not related to any events
  async _cleanUnused () {
    const places = await Place.findAll({
      include: [{ model: Event, as: 'events', required: false, attributes: [] }],
      group: ['place.id'],
      having: Sequelize.where(Sequelize.fn('COUNT', Sequelize.col('events.id')), '=', 0)
    })
    if (!places.length) { return }
    log.debug(`Remove ${places.length} unrelated places: %s`, places.map(p => p.name).join(', '))

    const ids = places.map(p => p.id)
    await Place.destroy({
      where: { id: { [Sequelize.Op.in]: ids } }
    })
  }
}
