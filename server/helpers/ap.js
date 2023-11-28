const { Event, Tag } = require('../api/models/models')
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
    }})

    if (!events.length) { return }

    log.info(`Remove ${events.length} past federated events`)

    await Event.destroy({
        where: {
            start_datetime: { [Op.lt]: now },
            apUserApId: { [Op.ne]: null }
        }
    })
  }
}
