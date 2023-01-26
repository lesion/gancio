const rateLimit = require('express-rate-limit')
const log = require('../log')

const next = (req, res, next) => next()

const instanceApiRateLimiter = {

  DDOSProtectionApiRateLimiter: (process.env.NODE_ENV === 'test' ? next : rateLimit({
    windowMs: 60 * 1000, // 5 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 5 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (request, response, next, options) => {
      log.warn(`DDOS protection api rate limiter: > 100req/minute/ip ${request.ip}`)
      return response.status(options.statusCode).send(options.message)    
    }
  })),
  
  SPAMProtectionApiRateLimiter: (process.env.NODE_ENV === 'test' ? next : rateLimit({
    windowMs: 5 * 60 * 1000, // 10 minutes
    max: 3, // Limit each IP to 3 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (request, response, next, options) => {
      log.warn(`SPAM protection api rate limiter: 3req/5min/ip ${request.ip}`)
      return response.status(options.statusCode).send(options.message)    
    }
  }))

}

module.exports = instanceApiRateLimiter