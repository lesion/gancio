const { Event, Resource, EventNotification } = require('../api/models/models')
const { Op } = require('sequelize')
const { DateTime } = require('luxon')
const log = require('../log')
module.exports = {
  // remove past federated events
  async _cleanPastEvents () {
    const now = DateTime.now().toUnixInteger()
    const events = await Event.findAll({ where: {
        start_datetime: { [Op.lt]: now },
        apUserApId: { [Op.ne]: null }
    }, raw: true })

    if (!events.length) { return }

    log.info(`[AP] Remove ${events.length} past federated events and related resources`)
    const eventsId = events.map(e => e.id)
    await Resource.destroy({ where: { eventId: eventsId }})

    await EventNotification.destroy({ where: { eventId: eventsId }})


    await Event.destroy({ where: { id: eventsId } }).catch(e => {
      log.debug('[AP] Error while removing past federated events: %s', JSON.stringify(e))
    })
  }
}
