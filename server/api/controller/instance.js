const { APUser, Instance, Resource } = require('../models/models')

const Sequelize = require('sequelize')

const instancesController = {
  async getAll (req, res) {
    const instances = await Instance.findAll({
      attributes: [
        'domain', 'name', 'data', 'blocked',
        [Sequelize.fn('COUNT', Sequelize.col('ap_users.ap_id')), 'users']
      ],
      order: [[Sequelize.fn('COUNT', Sequelize.col('ap_users.ap_id')), 'DESC']],
      group: ['instance.domain'],
      include: [{ model: APUser, attributes: [] }]
    })
    return res.json(instances)
  },

  // async getUsedInstance (req, res) {
  //   // const ap_users = await APUser.findAll({
  //   //   attributes: ['ap_id', 'blocked', 'instanceDomain'],
  //   //   where: { [Op.or]: [{ follower: true }, { blocked: true }] },
  //   //   include: [
  //   //     { model: Resource, attributes: ['id', 'eventId'], include: [{ model: Event, attributes: ['title'] }] },
  //   //     { model: Instance, attributes: ['blocked', 'name', 'domain'] }],
  //   //   nest: true,
  //   //   raw: true
  //   // })
  //   const instances = await Instance.findAll({
  //     include: [
  //       { model: APUser, where: { [Op.or]: [{ follower: true }, { blocked: true }] }, attributes: [] }
  //     ],
  //     attributes: ['domain', 'name', 'blocked'],
  //     raw: true
  //   })
  //   console.error(instances)
  //   res.json(instances)
  // },

  /**
   * get instance's users
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
