const { createLogger, transports, format } = require('winston')

const logger = createLogger({
  transports: process.env.NODE_ENV !== 'production'
    ? [new transports.Console(
        { level: 'debug', format: format.combine(format.colorize(), format.simple(), format.errors({ stack: true })) }
      )]
    : [new transports.File(
        {
          filename: 'gancio.log',
          format: format.combine(format.simple(), format.errors({ stack: true }))
        }
      )]
})

module.exports = logger
