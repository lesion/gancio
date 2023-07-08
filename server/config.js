const fs = require('fs')
const path = require('path')
const URL = require('url')

let config = {
  status: 'SETUP',
  baseurl: '',
  hostname: '',
  server: {
    host: process.env.GANCIO_HOST || '0.0.0.0',
    port: process.env.GANCIO_PORT || 13120
  },
  log_level: 'debug',
  log_path: path.resolve(process.env.cwd || '', 'logs'),
  db: {},
  user_locale: path.resolve(process.env.cwd || '', 'user_locale'),
  upload_path: path.resolve(process.env.cwd || '', 'uploads'),
  proxy: {
    protocol: process.env.GANCIO_PROXY_PROTOCOL || '',
    hostname: process.env.GANCIO_PROXY_HOSTNAME || '',
    host: process.env.GANCIO_PROXY_HOST || '',
    port: process.env.GANCIO_PROXY_PORT || '',
    auth: {
      username: process.env.GANCIO_PROXY_USERNAME || '',
      password: process.env.GANCIO_PROXY_PASSWORD || ''
    },
    headers: process.env.GANCIO_PROXY_HEADERS && JSON.parse(process.env.GANCIO_PROXY_HEADERS) || {}
  },
  write (config_path= process.env.config_path || './config.json') {
    delete config.status
    return fs.writeFileSync(config_path, JSON.stringify(config, null, 2))
  },

  load () {
    // load configuration from file
    const config_path = process.env.config_path || './config.json'
    console.info(`> Reading configuration from: ${config_path}`)
    if (fs.existsSync(config_path)) {
      const configContent = fs.readFileSync(config_path)
      config = Object.assign(config, JSON.parse(configContent))
      config.status = 'CONFIGURED'
      if (!config.hostname) {
        config.hostname = new URL.URL(config.baseurl).hostname
      }
    } else {
      config.status = 'SETUP'
      console.info('> Configuration file does not exists...')
    }
  }
}

config.load()
module.exports = config