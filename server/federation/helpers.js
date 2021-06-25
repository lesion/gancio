const axios = require('axios')
// const request = require('request')
const crypto = require('crypto')
const config = require('config')
const httpSignature = require('http-signature')
const APUser = require('../api/models/ap_user')
const Instance = require('../api/models/instance')
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

  async signAndSend (message, inbox) {
    // get the URI of the actor object and append 'inbox' to it
    const inboxUrl = new url.URL(inbox)
    const privkey = settingsController.secretSettings.privateKey
    const signer = crypto.createSign('sha256')
    const d = new Date()
    // digest header added for Mastodon 3.2.1 compatibility
    const digest = crypto.createHash('sha256')
      .update(message)
      .digest('base64')
    const stringToSign = `(request-target): post ${inboxUrl.pathname}\nhost: ${inboxUrl.hostname}\ndate: ${d.toUTCString()}\ndigest: SHA-256=${digest}`
    signer.update(stringToSign)
    signer.end()
    const signature = signer.sign(privkey)
    const signature_b64 = signature.toString('base64')
    const header = `keyId="${config.baseurl}/federation/u/${settingsController.settings.instance_name}",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="${signature_b64}"`
    try {
      const ret = await axios(inbox, {
        headers: {
          Host: inboxUrl.hostname,
          Date: d.toUTCString(),
          Signature: header,
          Digest: `SHA-256=${digest}`,
          'Content-Type': 'application/activity+json; charset=utf-8',
          Accept: 'application/activity+json, application/json; chartset=utf-8'
        },
        method: 'post',
        data: message
      })
      log.debug(`signed ${ret.status} => ${ret.data}`)
    } catch (e) {
      log.error(`Response: ${e.response.status} ${e.response.data}`)
    }
  },

  async sendEvent (event, type = 'Create') {
    if (!settingsController.settings.enable_federation) {
      log.info('event not send, federation disabled')
      return
    }

    const followers = await APUser.findAll({ where: { follower: true } })
    const recipients = {}
    followers.forEach(follower => {
      const sharedInbox = follower.object.endpoints.sharedInbox
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
        object: event.toAPNote(settingsController.settings.instance_name,
          settingsController.settings.instance_locale,
          recipients[sharedInbox])
      }
      body['@context'] = [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1',
        {
          Hashtag: 'as:Hashtag'
        }]
      await Helpers.signAndSend(JSON.stringify(body), sharedInbox)
    }
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

    fedi_user = await axios.get(URL, { headers: { Accept: 'application/jrd+json, application/json' } })
      .then(res => {
        if (res.status !== 200) {
          log.warn(`Actor ${URL} => ${res.statusText}`)
          return false
        }
        return res.data
      })
      .catch(e => {
        log.error(`${URL}: ${e}`)
        return false
      })

    if (fedi_user) {
      log.info(`Create a new AP User => ${URL}`)
      fedi_user = await APUser.create({ ap_id: URL, object: fedi_user })
    }
    return fedi_user
  },

  async getInstance (actor_url, force = false) {
    actor_url = new url.URL(actor_url)
    const domain = actor_url.host
    const instance_url = `${actor_url.protocol}//${actor_url.host}`
    log.debug(`getInstance ${domain}`)
    let instance
    if (!force) {
      instance = await Instance.findByPk(domain)
      if (instance) { return instance }
    }

    // TODO: is this a standard? don't think so
    instance = await axios.get(`${instance_url}/api/v1/instance`, { headers: { Accept: 'application/json' } })
      .then(res => res.data)
      .then(instance => {
        const data = {
          stats: instance.stats,
          thumbnail: instance.thumbnail
        }
        return Instance.create({ name: instance.title, domain, data, blocked: false })
      })
      .catch(e => {
        log.error(e)
        return Instance.create({ name: domain, domain, blocked: false })
      })
    return instance
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
      return res.status(401).send('Actor not found')
    }
    if (user.blocked) {
      log.info(`User ${user.ap_id} blocked`)
      return res.status(401).send('User blocked')
    }

    req.fedi_user = user

    // TODO: check Digest // cannot do this with json bodyparser
    // const digest = crypto.createHash('sha256')
    //   .update(req.body)
    //   .digest('base64')
    // if (`SHA-256=${digest}` !== req.headers.signature) {
    //   log.warning(`Signature mismatch ${req.headers.signature} - ${digest}`)
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
      log.info(`Actor ${req.body.actor} not found`)
      return res.status(401).send('Actor not found')
    }
    if (httpSignature.verifySignature(parsed, user.object.publicKey.publicKeyPem)) { return next() }

    // still not valid
    log.info(`Invalid signature from user ${req.body.actor}`)
    res.send('Request signature could not be verified', 401)
  }
}

module.exports = Helpers
