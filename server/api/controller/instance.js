const { ap_user: APUser, instance: Instance, resource: Resource } = require('../models')

const instancesController = {
  async getAll (req, res) {
    const instances = await Instance.findAll()

    return res.json(instances)
  },

  /**
   * get instance users
   */
  async get (req, res) {
    const ap_users = await APUser.findAll({ where: { instanceDomain: req.params.instance_domain }, include: [Resource] })
    return res.json(ap_users)
  },

  async toggleBlock (req, res) {
    const instance = await Instance.findByPk(req.body.instance)
    if (!instance) { return res.status(404).send('Not found') }
    await instance.update({ blocked: req.body.blocked })
    return res.json(instance)
  }
}

module.exports = instancesController
