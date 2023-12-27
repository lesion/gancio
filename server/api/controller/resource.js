const { Resource, APUser, Event } = require('../models/models')
const get = require('lodash/get')

const resourceController = {
  async hide (req, res) {
    const resource_id = req.params.resource_id
    const hidden = req.body.hidden
    const resource = await Resource.findByPk(resource_id)
    if (!resource) {
      return res.sendStatus(404)
    }
    await resource.update({ hidden })
    res.json(resource)
  },

  async remove (req, res) {
    const resource_id = req.params.resource_id
    const resource = await Resource.findByPk(resource_id)
    if (!resource) {
      return res.sendStatus(404)
    }
    await resource.destroy()
    res.sendStatus(200)
  },

  async getAll (req, res) {
    const limit = req.body.limit || 1000
    // const where = {}
    // if (req.params.instanceId) {
    //   where =
    //
    let resources = await Resource.findAll({ limit, include: [APUser, Event], order: [['createdAt', 'DESC']] })
    resources = resources.map(r => ({
      id: r.id,
      hidden: r.hidden,
      created: r.createdAt,
      data: {
        content: r.data.content
      },
      event: {
        id: r.event.id,
        title: r.event.title,
        slug: r.event.slug
      },
      ap_user: {
        url: get(r, 'ap_user.object.url', ''),
        ap_id: get(r, 'ap_user.ap_id', ''),
        preferredUsername: get(r, 'ap_user.object.preferredUsername', '')
      }
    }))
    res.json(resources)
  }
}

module.exports = resourceController
