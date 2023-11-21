const { APUser, Instance, Resource } = require('../models/models')
const { getActor, unfollowActor, followActor } = require('../../federation/helpers')
const axios = require('axios')
const get = require('lodash/get')

const Sequelize = require('sequelize')
const log = require('../../log')

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

  // get friendly users
  async getFriendly (req, res) {
    const friendly_users = await APUser.findAll({ where: { friendly: true }, include: [Instance]})
    return res.json(friendly_users)
  },

  // toggle instance block
  async toggleBlock (req, res) {
    const instance = await Instance.findByPk(req.body.instance)
    if (!instance) { return res.status(404).send('Not found') }
    await instance.update({ blocked: req.body.blocked })
    return res.json(instance)
  },


  async removeFriendly (req, res) {
    let ap_id = req.query.ap_id
    log.info(`Remove friendly instance ${ap_id} ...`)
    
    try {
      const actor = await getActor(ap_id)
      if (!actor || !actor.friendly) {
        return res.sendStatus(404)
      }

      if (actor.following) {
        // unfollow
        await unfollowActor(actor)
      }

      // remove friendlyness
      await actor.update({ friendly: false })

    } catch (e) {
      log.warn(e)
      return res.status(400).send(e)      
    }

    return res.sendStatus(200)

  },

  async addFriendly (req, res) {

    let instance_url = req.body.instance_url
    try {
      if (!instance_url.startsWith('http')) {
        instance_url = `https://${instance_url}`
      }
      instance_url = instance_url.replace(/\/$/, '')

      log.info(`Add friendly instance ${instance_url} ...`)
      const { data: nodeinfo } = await axios.get(`${instance_url}/.well-known/nodeinfo/2.1`)

      // create a new instance
      const instance = {
        url: instance_url,
        name: get(nodeinfo, 'metadata.nodeName', ''),
        label: get(nodeinfo, 'metadata.nodeLabel', ''),
        actor: get(nodeinfo, 'metadata.nodeActor', ''),
        timezone: get(nodeinfo, 'metadata.nodeTimezone', '')
      }

      log.debug(`instance .well-known: ${instance.name} / ${instance.actor}`)

      // if we have an actor, let's make friend
      if (instance.actor) {

        // send a well-known request
        const instance_hostname = new URL(instance_url).host
        const { data: wellknown } = await axios.get(`${instance_url}/.well-known/webfinger?resource=acct:${instance.actor}@${instance_hostname}`)

        // search for actor url
        const actorURL = wellknown?.links.find(l => l.rel === 'self').href

        // retrieve the AP actor and flat it as friendly
        const actor = await getActor(actorURL)
        await actor.update({ friendly: true })

        return res.json(actor)
      }
    } catch (e) {
      console.error(e)
      console.error(String(e))
      log.warn(e)
      return res.status(400).send(e)
    }
  }
}

module.exports = instancesController
