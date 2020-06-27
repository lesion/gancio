const APUser = require('../models/ap_user')

const apUserController = {
  async toggleBlock (req, res) {
    const ap_id = req.body.ap_id
    try {
      const user = await APUser.findByPk(ap_id)
      await user.update({ blocked: !user.blocked })
      res.json(user)
    } catch (e) {
      res.sendStatus(404)
    }
  }
}

module.exports = apUserController
