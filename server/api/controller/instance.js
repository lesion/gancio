const { APUser, Instance, Resource } = require('../models/models')
const { getActor, unfollowActor, followActor } = require('../../federation/helpers')
const axios = require('axios')
const get = require('lodash/get')

const Sequelize = require('sequelize')
const log = require('../../log')
const { getNodeInfo } = require('../../federation/helpers')

const instancesController = {

  /**
   * get all fediverse instances
   * used in moderation panel
   */
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

    /**
     * url
     * in case we have a @ we should use webfinger 
     * in case we have a full url could be an actor
     * or a nodeinfo url to search for 
     */
    let url = req.body.url

    if (url.includes('@')) {
      const [ user, instance_url ] = url.replace(/^@/,'').split('@')
      log.debug('[FEDI] Adds user: %s and instance: %s because url was: %s', user, instance_url, url)
      try {
        const webfinger = await axios.get(`https://${instance_url}/.well-known/webfinger?resource=acct:${user}@${instance_url}`).then(res => res.data)
        if (webfinger?.links) {
          const actor_url = webfinger.links.find(l => l.rel === 'self')

          // if (!instance_url.startsWith('http')) {
          //   instance_url = `https://${instance_url}`
          // }          
          log.info(`[FEDI] Adding trusted instance ${instance_url} and actor ${actor_url.href}...`)
          const { applicationActor, nodeInfo } = await getNodeInfo('https://' + instance_url)
    
          // create a new instance
          const instance = {
            url: 'https://' + instance_url,
            name: get(nodeInfo, 'metadata.nodeName', ''),
            label: get(nodeInfo, 'metadata.nodeLabel', ''),
            timezone: get(nodeInfo, 'metadata.nodeTimezone', ''),
          }
          const actor = await getActor(actor_url.href)
          log.debug('[FEDI] Actor %s', actor)
          await actor.update({ friendly: true })
          return res.json(actor)    
        }
      } catch (e) {
        console.error(e)
        log.error('[FEDI] Wrong webfinger response from %s: %s ', url, e?.response?.data ?? String(e))
        return res.sendStatus(404)
      }
    }

    try {
      if (!url.startsWith('http')) {
        url = `https://${url}`
      }
      url = url.replace(/\/$/, '')

      log.info(`[FEDI] Adding trusted instance ${url} ...`)
      const { applicationActor, nodeInfo } = await getNodeInfo(url)

      // create a new instance
      const instance = {
        url: url,
        name: get(nodeInfo, 'metadata.nodeName', ''),
        label: get(nodeInfo, 'metadata.nodeLabel', ''),
        timezone: get(nodeInfo, 'metadata.nodeTimezone', ''),
      }

      if (applicationActor) {
        log.debug('[FEDI] This node supports FEP-2677')
        const actor = await getActor(applicationActor)
        log.debug('[FEDI] Actor %s', actor)
        await actor.update({ friendly: true })
        return res.json(actor)
      }

      if (nodeInfo?.software?.name === 'Mobilizon') {
        instance.actor = 'relay'
      } else if (nodeInfo?.software?.name === 'gancio') {
        instance.actor = get(nodeInfo, 'metadata.nodeActor', 'relay')
      }
      log.debug(`instance .well-known: ${instance.name} / ${instance.actor}`)

      // if we have an actor, let's make friend
      if (instance.actor) {

        // send a well-known request
        const instance_hostname = new URL(url).host
        const { data: wellknown } = await axios.get(`${url}/.well-known/webfinger?resource=acct:${instance.actor}@${instance_hostname}`)

        // search for actor url
        const actorURL = wellknown?.links.find(l => l.rel === 'self').href

        // retrieve the AP actor and flat it as friendly
        const actor = await getActor(actorURL)
        await actor.update({ friendly: true })

        return res.json(actor)
      }
    } catch (e) {
      console.error(e) 
      log.error('[FEDI] Error adding friendly instance %s', e?.response?.data ?? String(e))
      return res.status(400).send(e)
    }
  }
}

module.exports = instancesController
