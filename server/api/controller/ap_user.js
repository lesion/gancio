const { ap_users: APUsers } = require('../models')

const apUserController = {
  async toggleBlock (req, res) {
    const user_id = req.body.user_id
    const user = await APUsers.findByPk(user_id)
    user.update({ blocked: !user.blocked })
    res.json(user)
  }
}

module.exports = apUserController
