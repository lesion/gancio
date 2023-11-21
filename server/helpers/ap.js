const { Event, Tag } = require('../api/models/models')
const { DateTime } = require('luxon')

module.exports = {
  // remove past federated events
  async _cleanPastEvents () {
    const now = DateTime.now().toUnixInteger()
    const events = await Event.findAll({ where: {
        start_datetime: { [Op.lt]: now },
        apUserApId: { [Op.ne]: null }
    }})

    log.info(`Remove ${events.length} past federated events)`)

    await Event.destroy({
        where: {
            start_datetime: { [Op.lt]: now },
            apUserApId: { [Op.ne]: null }
        }
    })
  }
}
