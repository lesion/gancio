const rateLimit = require('express-rate-limit');
const log = require('../../log')
const nominatim = require('../../services/geocoding/nominatim')
const photon = require('../../services/geocoding/photon')
const axios = require('axios')
const { version } = require('../../../package.json')
const cache = require('memory-cache');
let d = 0 // departure time
let h = 0 // hit geocoding provider time (aka Latency)

const geocodingController = {
  /**
   * TODO: replace/merge with a general 'instance rate-limiter' or 'instance api-related rate-limiter' when this will be defined
   */  
  instanceApiRateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  }),

  /** 
   * Limit provider api usage.
   * From https://operations.osmfoundation.org/policies/nominatim/
   * [Requirements] No heavy uses (an absolute maximum of 1 request per second).
   * [Websites and Apps] 
   * - Note that the usage limits above apply per website/application: the sum of traffic by all your users should not exceed the limits.
   * - If at all possible, set up a proxy and also enable caching of requests. 
   */
  providerRateLimit (req, res, next, providerCommonName) {
    let a = Date.now(); // arrival time
    let dprev = d
    d = dprev + 1000 + h

    // console.log('a: ' + a)
    // console.log('dprev: ' + dprev)
    // console.log('d: ' + d)

    // if the same request was already cached skip the delay mechanism
    if (cache.get(providerCommonName + '_' + req.params.place_details)) {
      if (a < d) {
        log.warn('More than 1 request per second to geocoding api. This from ' + req.ip + ' . The response data is served from memory-cache.')
      }
      // reset departure time because there is no need to ask provider
      d = dprev
      return next()
    }

    if (d === 0 || a > d) {
      // no-queue or old-queue
      // console.log('No queue or Old queue')
      // arrival time + 10ms estimated computing time
      d = a + 10 
      next()
    } else {
      // fresh queue
      // console.log('Fresh queue')
      let wait = d - a
      // console.log('Waiting '+ wait)
      log.warn('More than 1 request per second to geocoding api. This from ' + req.ip + ' . Applying ToS padding before asking to provider. The response data is now cached.')
      
      setTimeout(() => {
        next()
      }, wait)
    }
    
  },

  async nominatimRateLimit(req, res, next) {
    geocodingController.providerRateLimit(req, res, next, nominatim.commonName)
  },

  async photonRateLimit(req, res, next) {
    geocodingController.providerRateLimit(req, res, next, photon.commonName)
  },

  async checkInCache (req, res, details, providerCommonName) {
    if (cache.get(providerCommonName + '_' + details)) { 
      const ret = await cache.get(providerCommonName + '_' + details) 
      return ret
    } else {
      // console.log('Not in cache')
      return
    }
  },

  async queryProvider(req, res, details, provider) {
    let RTTstart = Date.now()
    // console.log('Asking Provider: ' + RTTstart)

    const ret = await axios.get(`${provider.endpoint(req, res)}`, { 
      params: provider.getParams(req, res),
      headers: { 'User-Agent': `gancio ${version}` }
    })

    if (ret) {
      let RTTend = Date.now()
      // console.log('Asking Provider: ' + RTTend)
      // Save the hit time (aka Latency)
      // console.log('Saving latency h: ' + h)
      h = (RTTend - RTTstart) / 2
    }

    // Cache the response data
    cache.put(provider.commonName + '_' + details, ret.data, 1000 * 60 * 60 * 24);
    // console.log(cache.keys())
    // console.log(cache.exportJson())
    return ret.data
  },


  async _nominatim (req, res) {
    const details = req.params.place_details

    const ret = await geocodingController.checkInCache(req, res, details, nominatim.commonName) ||
      await geocodingController.queryProvider(req, res, details, nominatim)

    return res.json(ret)

  },

  async _photon (req, res) {
    const details = req.params.place_details

    const ret = await geocodingController.checkInCache(req, res, details, photon.commonName) ||
      await geocodingController.queryProvider(req, res, details, photon)

    return res.json(ret)

  },

}

module.exports = geocodingController