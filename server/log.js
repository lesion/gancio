const { createLogger, transports, format } = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const dayjs = require('dayjs')
const config = require('config')

const gancioFormat = format.printf(({ timestamp, level, message }) => {
  return `${dayjs(timestamp).format('DD MMM YYYY HH:mm:ss')} ${level}: ${message}`
})

const logger = createLogger({
  exitOnError: false,
  transports: process.env.NODE_ENV !== 'production'
    ? [new transports.Console(
        {
          handleExceptions: true,
          handleRejections: true,
          level: 'debug',
          format: format.combine(format.timestamp(), format.splat(), format.colorize(), gancioFormat)
        }
      )]
    : [new DailyRotateFile({
        handleExceptions: true,
        handleRejections: true,
        level: config.loglevel || 'info',
        filename: './logs/gancio.%DATE%.log',
        symlinkName: 'gancio.log',
        createSymlink: true,
        zippedArchive: true,
        maxSize: '10m',
        maxFiles: '14d',
        format: format.combine(format.timestamp(), format.splat(), gancioFormat)
      })]
})

module.exports = logger
