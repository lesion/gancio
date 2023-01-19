const rateLimit = require('express-rate-limit');
const log = require('../../log')
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const PHOTON_URL = 'https://photon.komoot.io/api/'
const axios = require('axios')
const { version } = require('../../../package.json')
const cache = require('memory-cache');
let d = 0 // departure time
let h = 0 // hit geocoding provider time (aka Latency)

const geolocationController = {
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
   * Limit api usage
   * From https://operations.osmfoundation.org/policies/nominatim/
   * [Requirements] No heavy uses (an absolute maximum of 1 request per second).
   * [Websites and Apps] 
   * - Note that the usage limits above apply per website/application: the sum of traffic by all your users should not exceed the limits.
   * - If at all possible, set up a proxy and also enable caching of requests. 
   */
  providerRateLimit (req, res, next) {
    let a = Date.now(); // arrival time
    let dprev = d
    d = dprev + 1000 + h

    console.log('a: ' + a)
    console.log('dprev: ' + dprev)
    console.log('d: ' + d)

    // if the same request was already cached skip the delay mechanism
    if (cache.get(req.params.place_details)) {
      if (a < d) {
        log.warn('More than 1 request per second to geolocation api. This from ' + req.ip + ' . The response data is served from memory-cache')
      }
      // reset departure time because there is no need to ask provider
      d = dprev
      return next()
    }

    if (d === 0 || a > d) {
      // no-queue or old-queue
      console.log('No queue or Old queue')
      // arrival time + 10ms estimated computing time
      d = a + 10 
      next()
    } else {
      // fresh queue
      console.log('Fresh queue')
      let wait = d - a
      console.log('Waiting '+ wait)
      log.warn('More than 1 request per second to geolocation api. This from ' + req.ip + ' . Applying ToS padding before asking to provider. The response data is now cached.')
      
      setTimeout(() => {
        next()
      }, wait)
    }
    
  },

  async _nominatim (req, res) {
    const details = req.params.place_details
    const countrycodes = res.locals.settings.geocoding_countrycodes || []
    const geocoding_provider = res.locals.settings.geocoding_provider || NOMINATIM_URL
    // ?limit=3&format=json&namedetails=1&addressdetails=1&q=

    const ret = await axios.get(`${geocoding_provider}`, {
      params: {
        countrycodes: countrycodes.join(','),
        q: details,
        limit: 3,
        format: 'json',
        addressdetails: 1,
        namedetails: 1,
      },
      headers: { 'User-Agent': `gancio ${version}` }
    })

    return res.json(ret.data)

  },

  async _photon (req, res) {
    const details = req.params.place_details
    const geocoding_provider = res.locals.settings.geocoding_provider || PHOTON_URL

    if (cache.get(details)) { 
      console.log('Retrieving data from cache')
      const ret = {
        data: await cache.get(details) 
      }
      return res.json(ret.data) 
    } else {
      let RTTstart = Date.now()

      console.log('Asking Provider: ' + RTTstart)
      const ret = await axios.get(`${geocoding_provider}`, {
        params: {
          q: details,
          limit: 3,
        },
        headers: { 'User-Agent': `gancio ${version}` }
      })

      if (ret) { 
        let RTTend = Date.now()
        console.log('Response arrived: ' + RTTend)
        // Save the hit time (aka Latency)
        h = (RTTend - RTTstart) / 2
        console.log('Saving latency h: ' + h)
      }

      console.log('Caching results')
      cache.put(details, ret.data);
      return res.json(ret.data)
    }
 
  },

}

module.exports = geolocationController