const Sequelize = require('sequelize')
const { fed_users: FedUsers, instances: Instances, comment: Comment } = require('../models')

const instancesController = {
  async getAll (req, res) {
    const instances = await Instances.findAll({
      attributes: {
        include: [[Sequelize.fn('count', Sequelize.col('domain')), 'users']]
      },
      group: ['domain'],
      include: [{ model: FedUsers, attributes: [] }]
    })
    return res.json(instances)
  },

  /**
   * get instance users
   */
  async get (req, res) {
    const fedi_users = await FedUsers.findAll({ where: { instanceDomain: req.params.instance_domain }, include: [Comment] })
    return res.json(fedi_users)
  },

  async toggleBlock (req, res) {
    const instance = await Instances.findByPk(req.body.instance)
    if (!instance) { return res.status(404).send('Not found') }
    await instance.update({ blocked: req.body.blocked })
    return res.json(instance)
  }
}

module.exports = instancesController
