const rateLimit = require('express-rate-limit');
const log = require('../../log')
let d // departure time

const geolocationController = {
  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  }),

  /** 
   * Limit api usage
   * From https://operations.osmfoundation.org/policies/nominatim/
   * [Requirements] No heavy uses (an absolute maximum of 1 request per second).
   * [Websites and Apps] Note that the usage limits above apply per website/application: the sum of traffic by all your users should not exceed the limits.
   */
  apiLimit (req, res, next) {
    let dprev = d // departure time of previous
    let a = Date.now() // arrival time

    if (typeof dprev !== 'undefined') {
      d = dprev + 1000

      if (a > d) {
        d = a + 10
        geolocationController.rateLimiter(req, res, next)
      } else {
        let wait = d - a
        log.warn('More than 1 request per second to geolocation api. This from ' + req.ip)

        setTimeout(() => {
          geolocationController.rateLimiter(req, res, next)
        }, wait)
      }
    } else {
      d = a + 10 // add 10ms
      geolocationController.rateLimiter(req, res, next)
    }
    
  }
  
}

module.exports = geolocationController