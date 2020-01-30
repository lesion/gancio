const { event: Event } = require('../api/models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const events = await Event.findAll({})
    const promises = events.map(e => {
      return e.update({ recurrent: JSON.parse(e.recurrent) })
    })
    return Promise.all(promises)
  },

  down: async (queryInterface, Sequelize) => {
    const events = await Event.findAll({})
    const promises = events.map(e => {
      return e.update({ recurrent: JSON.stringify(e.recurrent) })
    })
    return Promise.all(promises)
  }
}
