const Resource = require('../models/resource')

const resourceController = {
  async hide (req, res) {
    const resource_id = req.params.resource_id
    const hidden = req.body.hidden
    const resource = await Resource.findByPk(resource_id)
    await resource.update({ hidden })
    res.json(resource)
  },

  async remove (req, res) {
    const resource_id = req.params.resource_id
    const resource = await Resource.findByPk(resource_id)
    await resource.destroy()
    res.sendStatus(200)
  },

  async getAll (req, res) {
    const limit = req.body.limit || 100
    // const where = {}
    // if (req.params.instanceId) {
    //   where =
    //
    const resources = await Resource.findAll({ limit })
    res.json(resources)
  }
}

module.exports = resourceController
