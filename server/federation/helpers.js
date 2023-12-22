const axios = require('axios')
const crypto = require('crypto')
const config = require('../config')
const httpSignature = require('@peertube/http-signature')

// process.env.NODE_TLS_REJECT_UNAUTHORIZED=0

const { APUser, Instance } = require('../api/models/models')

const url = require('url')
const settingsController = require('../api/controller/settings')
const log = require('../log')

const Helpers = {

  // ignore unimplemented ping url from fediverse
  spamFilter (req, res, next) {
    const urlToIgnore = [
      '/api/v1/instance',
      '/api/meta',
      '/api/statusnet/version.json',
      '/api/gnusocial/version.json',
      '/api/statusnet/config.json',
      '/status.php',
      '/siteinfo.json',
      '/friendika/json',
      '/friendica/json',
      '/poco'
    ]
    if (urlToIgnore.includes(req.path)) {
      log.debug(`Ignore noisy fediverse ${req.path}`)
      return res.status(404).send('Not Found')
    }
    next()
  },

  async signAndSend (message, inbox, method='post') {
    log.debug('[FEDI] Sign and send %s to %s', message, inbox)
    const inboxUrl = new url.URL(inbox)
    const privkey = settingsController.secretSettings.privateKey
    const signer = crypto.createSign('sha256')
    const d = new Date()

    let header
    let digest
    if (method === 'post') {
      digest = crypto.createHash('sha256')
        .update(message)
        .digest('base64')
      const stringToSign = `(request-target): post ${inboxUrl.pathname}\nhost: ${inboxUrl.hostname}\ndate: ${d.toUTCString()}\ndigest: SHA-256=${digest}`
      signer.update(stringToSign)
      signer.end()
      const signature = signer.sign(privkey)
      const signature_b64 = signature.toString('base64')
      header = `keyId="${config.baseurl}/federation/u/${settingsController.settings.instance_name}#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="${signature_b64}"`
    } else {
      const stringToSign = `(request-target): get ${inboxUrl.pathname}\nhost: ${inboxUrl.hostname}\ndate: ${d.toUTCString()}`
      signer.update(stringToSign)
      signer.end()
      const signature = signer.sign(privkey)
      const signature_b64 = signature.toString('base64')
      header = `keyId="${config.baseurl}/federation/u/${settingsController.settings.instance_name}#main-key",algorithm="rsa-sha256",headers="(request-target) host date",signature="${signature_b64}"`
    }
    try {
      const ret = await axios(inbox, {
        headers: {
          Host: inboxUrl.hostname,
          Date: d.toUTCString(),
          Signature: header,
          ...(method === 'post' && ({ Digest: `SHA-256=${digest}` })),
          'Content-Type': 'application/activity+json',
          Accept: 'application/activity+json'
        },
        method,
        ...( method === 'post' && ({ data: message}))
      })
      log.debug(`[FEDI] signed ${ret.status} => %s`, ret.data)
      return ret.data
    } catch (e) {
      log.error("[FEDI] Error in sign and send [%s]: %s", inbox, e?.response?.data?.error ?? e?.response?.statusMessage + ' ' + String(e))
    }
  },

  async sendEvent (event, type = 'Create') {
    if (!settingsController.settings.enable_federation) {
      log.info('event not send, federation disabled')
      return
    }

    const followers = await APUser.findAll({ where: { follower: true } })
    log.debug("[FEDI] Sending to [%s]", followers.map(f => f.ap_id).join(', '))
    const recipients = {}
    followers.forEach(follower => {
      const sharedInbox = follower?.object?.endpoints?.sharedInbox ?? follower?.object?.inbox
      if (!recipients[sharedInbox]) { recipients[sharedInbox] = [] }
      recipients[sharedInbox].push(follower.ap_id)
    })

    for (const sharedInbox in recipients) {
      log.debug(`Notify ${sharedInbox} with event ${event.title} cc => ${recipients[sharedInbox].length}`)
      const body = {
        id: `${config.baseurl}/federation/m/${event.id}#create`,
        type,
        to: ['https://www.w3.org/ns/activitystreams#Public'],
        cc: [...recipients[sharedInbox], `${config.baseurl}/federation/u/${settingsController.settings.instance_name}/followers`],
        actor: `${config.baseurl}/federation/u/${settingsController.settings.instance_name}`,
        object: event.toAP(settingsController.settings, recipients[sharedInbox])
      }
      body['@context'] = [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1',
        {
          Hashtag: 'as:Hashtag',
          focalPoint: { '@container': '@list', '@id': 'toot:focalPoint' }
        }]
      await Helpers.signAndSend(JSON.stringify(body), sharedInbox)
    }
  },

  async followActor (actor) {
    log.debug(`Following actor ${actor.ap_id}`)
    const body = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${config.baseurl}/federation/m/${actor.ap_id}#follow`,
      type: 'Follow',
      actor: `${config.baseurl}/federation/u/${settingsController.settings.instance_name}`,
      object: actor.ap_id
    }

    await Helpers.signAndSend(JSON.stringify(body), actor.object.endpoints?.sharedInbox || actor.object.inbox)
    await actor.update({ following: 1 })
  },

  async unfollowActor (actor) {
    log.debug(`Unfollowing actor ${actor.ap_id}`)
    const body = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${config.baseurl}/federation/m/${actor.ap_id}#follow`,
      type: 'Unfollow',
      actor: `${config.baseurl}/federation/u/${settingsController.settings.instance_name}`,
      object: actor.ap_id
    }
    await Helpers.signAndSend(JSON.stringify(body), actor.object.endpoints?.sharedInbox || actor.object.inbox)
    return actor.update({ following: 0 })
  },

  async getActor (URL, instance, force = false) {
    let fedi_user

    // try with cache first
    if (!force) {
      fedi_user = await APUser.findByPk(URL, { include: Instance })
      if (fedi_user) {
        if (!fedi_user.instances) {
          fedi_user.setInstance(instance)
        }
        return fedi_user
      }
    }

      fedi_user = await Helpers.signAndSend('', URL, 'get')
      .catch(e => {
        log.error(`[FEDI] getActor ${URL}: %s`, e?.response?.data?.error ?? String(e) )
        return false
      })

    if (fedi_user) {
      log.info(`[FEDI] Create a new AP User => ${URL}`)
      fedi_user = await APUser.create({ ap_id: URL, object: fedi_user })
    }
    return fedi_user
  },

  async getNodeInfo (instance_url) {
      let nodeInfo = await axios.get(`${instance_url}/.well-known/nodeinfo`, { headers: { Accept: 'application/json' } }).then(res => res.data)
      
      if (nodeInfo?.links) {
        const supportedVersion = nodeInfo.links.find(l => l.rel === 'http://nodeinfo.diaspora.software/ns/schema/2.1' || 'http://nodeinfo.diaspora.software/ns/schema/2.0')
        if (!supportedVersion) {
          return false
        }
        const applicationActor = nodeInfo.links.find(l => l.rel === 'https://www.w3.org/ns/activitystreams#Application')
        nodeInfo = await axios.get(supportedVersion.href).then(res => res.data)
        log.debug('[FEDI] getNodeInfo "%s", applicationActor: %s, nodeInfo: %s', instance_url, applicationActor?.href, nodeInfo)
        return { applicationActor: applicationActor?.href, nodeInfo }
      }
      throw new Error(nodeInfo)
    },

  async getInstance (actor_url, force = false) {
    log.debug(`[FEDI] getInstance ${actor_url}`)
    actor_url = new url.URL(actor_url)
    const domain = actor_url.host
    const instance_url = `${actor_url.protocol}//${actor_url.host}`
    log.debug(`getInstance ${domain}`)
    let instance
    if (!force) {
      instance = await Instance.findByPk(domain)
      if (instance) { return instance }
    }

    try {
      ({ nodeInfo: instance } = await Helpers.getNodeInfo(instance_url))
      return Instance.create({ name: instance?.name ?? instance?.metadata?.nodeLabel ?? instance?.metadata?.nodeName ?? domain, domain, data: instance, blocked: false })
    } catch(e) {
      log.error('[FEDI] Wrong nodeInfo returned for "%s": %s', instance_url, e?.response?.data ?? String(e))
      // return Instance.create({ name: domain, domain, blocked: false })
    }
  },

  // ref: https://blog.joinmastodon.org/2018/07/how-to-make-friends-and-verify-requests/
  async verifySignature (req, res, next) {
    // TODO: why do I need instance?
    const instance = await Helpers.getInstance(req.body.actor)
    if (!instance) {
      log.warn(`Verify Signature: Instance not found ${req.body.actor}`)
      return res.status(401).send('Instance not found')
    }
    if (instance.blocked) {
      log.warn(`Instance ${instance.domain} blocked`)
      return res.status(401).send('Instance blocked')
    }

    let user = await Helpers.getActor(req.body.actor, instance)
    if (!user) {
      log.info(`Actor ${req.body.actor} not found`)
      if (req.body.type === 'Delete') {
        return res.sendStatus(201)
      }
      return res.status(401).send('Actor not found')
    }
    if (user.blocked) {
      log.info(`User ${user.ap_id} blocked`)
      return res.status(401).send('User blocked')
    }

    res.locals.fedi_user = user

    // TODO: check Digest // cannot do this with json bodyparser
    // const digest = crypto.createHash('sha256')
    //   .update(req.body)
    //   .digest('base64')
    // if (`SHA-256=${digest}` !== req.headers.signature) {
    //   log.warn(`Signature mismatch ${req.headers.signature} - ${digest}`)
    //   return res.status(401).send('Signature mismatch')
    // }

    // another little hack :/
    // https://github.com/joyent/node-http-signature/issues/87
    req.url = '/federation' + req.url
    const parsed = httpSignature.parseRequest(req)
    if (httpSignature.verifySignature(parsed, user.object.publicKey.publicKeyPem)) { return next() }

    // signature not valid, try without cache
    user = await Helpers.getActor(req.body.actor, instance, true)
    if (!user) {
      log.info(`[FEDI] Actor ${req.body.actor} not found`)
      return res.status(401).send('Actor not found')
    }
    if (httpSignature.verifySignature(parsed, user.object.publicKey.publicKeyPem)) {
      log.debug(`[FEDI] Valid signature from ${req.body.actor} `)
      return next()
    }

    // still not valid
    log.info(`[FEDI] Invalid signature from user ${req.body.actor}`)
    res.send('Request signature could not be verified', 401)
  }
}

module.exports = Helpers
