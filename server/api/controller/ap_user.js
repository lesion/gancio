const { ap_user: APUser } = require('../models')

const apUserController = {
  async toggleBlock (req, res) {
    const user_id = req.body.user_id
    const user = await APUser.findByPk(user_id)
    await user.update({ blocked: !user.blocked })
    res.json(user)
  }
}

module.exports = apUserController
