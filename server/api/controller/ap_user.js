const { APUser } = require('../models/models')
const log = require('../../log')

const apUserController = {
  async toggleBlock (req, res) {
    const ap_id = req.body.ap_id
    try {
      const user = await APUser.findByPk(ap_id)
      await user.update({ blocked: !user.blocked })
      log.debug('[AP] User %s %s', ap_id, user.blocked ? 'blocked' : 'unblocked')
      res.json(user)
    } catch (e) {
      res.sendStatus(404)
    }
  }
}

module.exports = apUserController
