const axios = require('axios')
const crypto = require('crypto')
const config = require('../config')
const httpSignature = require('@peertube/http-signature')
const { APUser, Instance, Event } = require('../api/models/models')
const dayjs = require('dayjs')
const { Task, TaskManager } = require('../taskManager')
const url = require('url')
const settingsController = require('../api/controller/settings')
const log = require('../log')
const helpers = require('../helpers')

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const Helpers = {

  '@context': [
    'https://www.w3.org/ns/activitystreams',
    'https://w3id.org/security/v1',
    {
      toot: 'http://joinmastodon.org/ns#',

      // A property-value pair, e.g. representing a feature of a product or place.
      // https://docs.joinmastodon.org/spec/activitypub/#PropertyValue
      schema: 'http://schema.org#',
      ProperyValue: 'schema:PropertyValue',
      value: 'schema:value',

      // https://docs.joinmastodon.org/spec/activitypub/#discoverable
      // This flag may be used as an indicator of the user’s preferences toward being included
      // in external discovery services, such as search engines or other indexing tools
      // in gancio is always true
      "discoverable": "toot:discoverable",

      // https://docs.joinmastodon.org/spec/activitypub/#Hashtag
      "Hashtag": "https://www.w3.org/ns/activitystreams#Hashtag",

      // supported but always false
      manuallyApprovesFollowers: 'as:manuallyApprovesFollowers',

      // focal point - https://docs.joinmastodon.org/spec/activitypub/#focalPoint
      "focalPoint": {
        "@container": "@list",
        "@id": "toot:focalPoint"
      }
    }
  ],

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
    log.debug('[FEDI] Sign and %s %s %s', method, message, inbox)
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
      log.error("[FEDI] Error in sign and send [%s]: %s", inbox, e?.response?.data?.error ?? e?.response?.statusMessage ?? '' + ' ' + String(e))
    }
  },

  async sendEvent (event, type = 'Create') {
    if (!settingsController.settings.enable_federation) {
      log.info('event not send, federation disabled')
      return
    }

    const followers = await APUser.findAll({ where: { follower: true } })
    log.debug("[FEDI] Sending to %d followers: [%s]", followers.length, followers.map(f => f.ap_id).join(', '))
    const recipients = {}
    followers.forEach(follower => {
      const sharedInbox = follower?.object?.endpoints?.sharedInbox ?? follower?.object?.inbox
      if (!recipients[sharedInbox]) { recipients[sharedInbox] = [] }
      recipients[sharedInbox].push(follower.ap_id)
    })

    for (const sharedInbox in recipients) {
      log.debug(`Notify ${sharedInbox} with event ${event.title} cc => ${recipients[sharedInbox].length}`)
      const body = {
        id: `${config.baseurl}/federation/m/${event.id}#${type}-${event.updatedAt.getTime()}`,
        type,
        to: ['https://www.w3.org/ns/activitystreams#Public'],
        cc: [...recipients[sharedInbox], `${config.baseurl}/federation/u/${settingsController.settings.instance_name}/followers`],
        actor: `${config.baseurl}/federation/u/${settingsController.settings.instance_name}`,
        object: event.toAP(settingsController.settings, recipients[sharedInbox], type)
      }
      body['@context'] = [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1',
        {
          toot: 'http://joinmastodon.org/ns#',

          // A property-value pair, e.g. representing a feature of a product or place. We use this to publish this very same instance
          // https://docs.joinmastodon.org/spec/activitypub/#PropertyValue
          schema: 'http://schema.org#',
          ProperyValue: 'schema:PropertyValue',
          value: 'schema:value',

          // https://docs.joinmastodon.org/spec/activitypub/#discoverable
          "discoverable": "toot:discoverable",

          // https://docs.joinmastodon.org/spec/activitypub/#Hashtag
          "Hashtag": "https://www.w3.org/ns/activitystreams#Hashtag",

          manuallyApprovesFollowers: 'as:manuallyApprovesFollowers',

          // focal point - https://docs.joinmastodon.org/spec/activitypub/#focalPoint
          "focalPoint": {
            "@container": "@list",
            "@id": "toot:focalPoint"
          }
        }]
        const task = new Task({
          name: 'AP',
          method: Helpers.signAndSend,
          args: [JSON.stringify(body), sharedInbox]
        })
        TaskManager.add(task)
    
    }
  },


  /**
   * Parses the location of an ActivityPub Event to extract physical and online locations.
   * @link https://www.w3.org/TR/activitystreams-vocabulary/#places
   * @link https://codeberg.org/fediverse/fep/src/commit/4a75a1bc50bc6d19fc1e6112f02c52621bc178fe/fep/8a8e/fep-8a8e.md#location
   * @param {Object} APEvent - The ActivityPub Event object
   * @returns {Array} An array containing the Place and a list of online locations
   */
  async parsePlace(APEvent) {
    const eventController = require('../api/controller/event')
    let place = null

    if (!APEvent?.location) {
      log.warn(`[FEDI] Event "${APEvent?.name}" has no location field`)
      return [null, null]
    }

    const locations = Array.isArray(APEvent.location) ? APEvent.location : [APEvent.location]

    // find the first physical place from locations
    let APPlace = locations.find(location => location.address && !location?.address?.url) || locations.find(location => !location.address?.url)

    // get the list of online locations
    let onlineLocations = locations.filter(location => location?.address?.url).map(location => location.address.url)

    // we have a physical place
    if (APPlace) {
      place = {
        place_name: APPlace?.name,
        ...(APPlace?.id && { place_ap_id: APPlace.id }),
        ...(APPlace?.latitude && APPlace?.longitude && { place_latitude: APPlace.latitude, place_longitude: APPlace.longitude }),
      }
    // no physical but at least virtual location
    } else if (onlineLocations.length) {
      place = {
        place_name: 'online'
      }
    // nothing...
    } else {
      log.warn(`[FEDI] No Physical nor Virtual location: ${JSON.stringify(APEvent.location)}`)
      return [null, null]
    }

    // the `address` field could be Text, PostalAddress or VirtualLocation, we do support the name as a fallback
    const addr = APPlace?.address
    if (addr) {
      if (typeof addr === 'string') {
        place.place_address = addr
      } else if ( addr?.streetAddress || addr?.addressLocality || addr?.addressCountry || addr?.addressRegion ) {
        place.place_address = [ addr?.streetAddress, addr?.addressLocality, addr?.addressRegion, addr?.addressCountry].filter(part => part).join(', ')
      } else if (addr?.url) {
        place.place_name = 'online'
      } else {
        console.warn(`[FEDI] Event "${APEvent?.name}" has bad address location: ${JSON.stringify(APPlace?.address)}`)
      }
    } else {
      place.place_address = place.place_name
    }

    place = await eventController._findOrCreatePlace(place)

    if (!place) {
        throw new Error('Place not found nor created')
    }

    return [place, onlineLocations]
  },

  /**
   *  Event object.type
   *  Create / Announce
   */
  async parseAPEvent (message, actor=message?.actor) {
      const tagController = require('../api/controller/tag')

      // has to have an object and a type property..
      if (!message?.object || !message?.type) {
        log.warn('[FEDI] message without `object` or `type` property: %s', message)
        throw new Error ('Wrong AP message: no object or type property')
      }

      // supporting Announce of a Create
      if (message.type === 'Announce' && message.object?.type === 'Create' && message.object?.object) {
        message.object = message.object.object
        message.type = 'Create'
      }

      // we only support Create / Event
      if (message.type === 'Create' && message.object.type === 'Event') {

        const APEvent = message.object

        // validate incoming events
        const required_fields = ['name', 'startTime', 'id']
        let missing_field = required_fields.find(required_field => !APEvent[required_field])
        if (missing_field) {
          log.warn(`[FEDI] ${missing_field} required`)
          throw new Error(`${missing_field} required`)
        }
    
        // check if this event is new
        const ap_id = APEvent.id
        const exists = await Event.findOne({ where: { ap_id }})
        if (exists) {
          log.warn('[FEDI] Avoid creating a duplicated event %s', ap_id)
          return exists
        }
    
        const [ place, online_locations ] = await Helpers.parsePlace(APEvent)
    
        let media = []
        const image_url = APEvent?.attachment?.find(a => a?.mediaType.includes('image') && a.url)?.url
        if (image_url) {
    
          const file = await helpers.getImageFromURL(image_url)
          log.debug('[FEDI] Download attachment for event %s', image_url)
    
          media = [{
            url: file.filename,
            height: file.height,
            width: file.width,
            name: APEvent.attachment[0]?.name || APEvent.name.trim() || '',
            size: file.size || 0,
            focalpoint: APEvent.attachment[0]?.focalPoint
          }]
        }
    
        // create it
        const event = await Event.create({
          title: APEvent?.name?.trim() ?? '',
          start_datetime: dayjs(APEvent.startTime).unix(),
          end_datetime: APEvent?.endTime ? dayjs(APEvent.endTime).unix() : null,
          description: helpers.sanitizeHTML(APEvent?.content ?? APEvent?.summary ?? ''),
          online_locations,
          media,
          is_visible: true,
          ap_id,
          ap_object: APEvent, 
          apUserApId: message?.actor,
        }).catch(e => {
          console.error(e)
          console.error(e?.message)
          console.error(e?.errors)
          return false
        })
    
        if (place) {
          await event.setPlace(place)
        }
    
        // create/assign tags
        let tags = []
        if (APEvent.tag) {
          tags = await tagController._findOrCreate(APEvent.tag.map(t => t?.name?.substr(1)))
          await event.setTags(tags)
        }
      }
  },

  async followActor (actor) {
    log.debug(`[FEDI] Following actor ${actor.ap_id}`)
    const body = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${config.baseurl}/federation/m/${actor.ap_id}#follow`,
      type: 'Follow',
      actor: `${config.baseurl}/federation/u/${settingsController.settings.instance_name}`,
      object: actor.ap_id
    }

    await Helpers.signAndSend(JSON.stringify(body), actor.object.endpoints?.sharedInbox ?? actor.object.inbox)
    await actor.update({ following: 1 })

    // let's try to get remote outbox
    const events = await Helpers.getOutbox(actor, 10)
    if (!events) {
      log.debug('[FEDI] No outbox events for %s', actor.ap_id)
      return
    }
    
    for(const event of events) {
      await Helpers.parseAPEvent(event, actor.ap_id).catch(e => {
        console.error(e.message)
        console.error(e.error)
        console.error(e)
      })
    }
  },

  async getOutbox(actor, limit) {
    log.debug('[FEDI] Get %s outbox', actor?.ap_id)
    
    if (!actor?.object?.outbox) return
    try {
      let collection = await Helpers.signAndSend('', actor?.object?.outbox, 'get')
      // embedded collection
      if (typeof collection?.first !== 'string') {
        return collection.first?.orderedItems ?? []
      } else if (/^https?:\/\//.test(collection?.first)) {
        collection = await Helpers.signAndSend('', collection.first, 'get')
        if (Array.isArray(collection?.orderedItems)) {
          return collection?.orderedItems ?? []
        }
      }
    } catch (e) {
      log.warn('[FEDI] getOutbox %s failed: %s', actor.ap_id, e )
      return []
    }
  },

  async unfollowActor (actor) {
    log.debug(`[FEDI] Unfollowing actor ${actor.ap_id}`)

    const object = {
      id: `${config.baseurl}/federation/m/${actor.ap_id}#follow`,
      type: 'Follow',
      object: actor.ap_id
    }
    
    const body = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${config.baseurl}/federation/m/${actor.ap_id}#unfollow`,
      type: 'Undo',
      actor: `${config.baseurl}/federation/u/${settingsController.settings.instance_name}`,
      object
    }
    await Helpers.signAndSend(JSON.stringify(body), actor.object.endpoints?.sharedInbox || actor.object.inbox)
    return actor.update({ following: 0 })
  },


  // get Actor from URL using GET HTTP Signature 
  async getActor (URL, instance, force = false, fail_on_not_cached = false) {
    log.debug(`[FEDI] getActor for ${URL}`)

    let fedi_user

    // try with cache first
    if (!force) {
      fedi_user = await APUser.findByPk(URL, { include: Instance })
      if (fedi_user) {
        return fedi_user
      } else if (fail_on_not_cached) {
        return false
      }
    }

    fedi_user = await Helpers.signAndSend('', URL, 'get')

    if (fedi_user) {
      log.info('[FEDI] Create/Update a new AP User "%s" and associate it to instance "%s"', URL, instance.domain)
      try {
        ([ fedi_user ] = await APUser.upsert({ ap_id: URL, object: fedi_user, instanceDomain: instance.domain, blocked: false }))
      } catch (e) {
        log.debug('[FEDI] Error in update/create ')
      }
    }
    return fedi_user
  },

  async getNodeInfo (instance_url) {
      let nodeInfo = await axios.get(`${instance_url}/.well-known/nodeinfo`, { headers: { Accept: 'application/json' } })
        .then(res => res.data)
        .catch(e => {
          log.debug('[FEDI] Node %s does not support nodeInfo', instance_url)
        })
      
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

  async getInstance (actor_url, force = false, fail_on_not_cached = false) {
    log.debug(`[FEDI] getInstance for ${actor_url}`)
    actor_url = new url.URL(actor_url)
    const domain = actor_url.host
    const instance_url = `${actor_url.protocol}//${actor_url.host}`
    let instance
    if (!force) {
      instance = await Instance.findByPk(domain)
      if (instance) {
        log.debug('[FEDI] Use cached instance: %s', instance.name)
        return instance
      } else if (fail_on_not_cached) {
        return false
      }
    }

    try {
      const { applicationActor, nodeInfo } = await Helpers.getNodeInfo(instance_url).catch(e => ({ }))
      const [ instance ] = await Instance.upsert({
          name: nodeInfo?.metadata?.nodeName ?? domain,
          domain,
          data: nodeInfo ?? {},
          blocked: false,
          applicationActor
        })
      log.debug('[FEDI] Create a new instance from %s: %s %s', instance_url, instance.name, nodeInfo)
      return instance
    } catch(e) {
      log.error('[FEDI] Wrong nodeInfo returned for "%s": %s', instance_url, e?.response?.data ?? String(e))
      return false
    }
  },

  /**
   * HTTP Signature middleware
   * https://www.w3.org/wiki/SocialCG/ActivityPub/Authentication_Authorization#Signing_requests_using_HTTP_Signatures
   * Each POST to /inbox coming from fediverse has to be verified.
   * Signature checking needs Actor's public key
   */
  async verifySignature (req, res, next) {

    const actor_url = req?.body?.actor

    const isDelete = req?.body?.type === 'Delete'

    // do we have an actor?
    if (!actor_url) {
      log.warn(`[FEDI] Verify Signature: No actor url or empty body`)
      return res.status(401).send('Actor not found')
    }

    // Get instance's nodeinfo
    // getting this from db if it is not the first time we interact with it
    const instance = await Helpers.getInstance(actor_url, false, isDelete)
    if (!instance) {
      log.warn(`[FEDI] Verify Signature: Instance not found ${actor_url}`)
      if (isDelete) {
        return res.sendStatus(201)
      }
      return res.status(401).send('Instance not found')
    }

    // Is this instance blocked?
    if (instance.blocked) {
      log.warn(`[FEDI] Instance ${instance.domain} blocked`)
      return res.status(401).send('Instance blocked')
    }

    // get actor
    let ap_actor = await Helpers.getActor(actor_url, instance, false, isDelete)
    if (!ap_actor) {
      log.info(`[FEDI] Actor ${actor_url} not found`)
      if (isDelete) {
        return res.sendStatus(201)
      }
      return res.status(401).send('Actor not found')
    }

    if (ap_actor.blocked) {
      log.info(`[FEDI] Actor ${ap_actor.ap_id} blocked`)
      return res.status(401).send('Actor blocked')
    }

    if (!ap_actor?.object?.publicKey?.publicKeyPem) {
      log.info(`[FEDI] Actor %s has no publicKey at %s`, ap_actor.ap_id, actor_url)
      return res.status(401).send('No public key')
    }

    res.locals.fedi_user = ap_actor

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
    if (httpSignature.verifySignature(parsed, ap_actor.object.publicKey.publicKeyPem)) { return next() }

    // signature not valid, try without cache
    ap_actor = await Helpers.getActor(actor_url, instance, true)
    if (!ap_actor) {
      log.info(`[FEDI] Actor ${actor_url} not found`)
      return res.status(401).send('Actor not found')
    }

    if (!ap_actor?.object?.publicKey?.publicKeyPem) {
      log.info(`[FEDI] Actor %s has no publicKey at %s`, ap_actor.ap_id, actor_url)
      return res.status(401).send('No public key')
    }

    if (httpSignature.verifySignature(parsed, ap_actor.object.publicKey.publicKeyPem)) {
      log.debug(`[FEDI] Valid signature from ${actor_url} `)
      return next()
    }

    // still not valid
    log.info(`[FEDI] Invalid signature from Actor ${actor_url}`)
    res.send('Request signature could not be verified', 401)
  }
}

module.exports = Helpers
