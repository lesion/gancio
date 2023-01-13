const rateLimit = require('express-rate-limit');
const log = require('../../log')
let curReq

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
    prevReq = curReq
    curReq = Date.now()
    deltaTime = (curReq - prevReq)

    if (typeof prevReq === 'undefined' || deltaTime > 1000) {
      geolocationController.rateLimiter(req, res, next)
    } else {
      log.warn('More than 1 request per second to geolocation api come from ' + req.ip)

      setTimeout(() => {
        geolocationController.rateLimiter(req, res, next)
      }, 1000 - deltaTime)
    }
    
  }
  
}

module.exports = geolocationController