const { createLogger, transports, format } = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const config = require('./config')

const gancioFormat = format.printf(info => {
  if (info.stack) {
    return `${info.timestamp} ${info.level}: ${info.message} \r\n${info.stack}`
  } else {
    return `${info.timestamp} ${info.level}: ${info.message}`
  }
})

const logger = createLogger({
  exitOnError: false,
  transports: process.env.NODE_ENV !== 'production'
    ? [new transports.Console(
        {
          level: 'debug',
          format: format.combine(format.splat(), format.timestamp(), format.colorize(), gancioFormat)
        }
      )]
    : [new DailyRotateFile({
        level: config.log_level || 'info',
        filename: config.log_path + '/gancio.%DATE%.log',
        symlinkName: 'gancio.log',
        createSymlink: true,
        zippedArchive: true,
        maxSize: '10m',
        maxFiles: '10d',
        format: format.combine(format.timestamp(), gancioFormat)
      }),
      new transports.Console(
        {
          level: config.log_level || 'info',
          format: format.combine(format.timestamp(), format.colorize(), gancioFormat)
        }
      )]
})

module.exports = logger
