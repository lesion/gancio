const fs = require('fs')
const path = require('path')

let config = {
  firstrun: true,
  baseurl: "http://localhost:13120",
  server: {
    host: '127.0.0.1',
    port: 13120
  },
  log_level: 'debug',
  log_path: path.resolve(process.env.cwd || '', 'logs'),
  db: {},
  upload_path: path.resolve(process.env.cwd || '', 'uploads'),
  write (config_path= process.env.config_path || './config.json') {
    return fs.writeFileSync(config_path, JSON.stringify(config, null, 2))
  },

  load () {
    // load configuration from file
    const config_path = process.env.config_path || './config.json'
    console.info(`> Reading configuration from: ${config_path}`)
    if (fs.existsSync(config_path)) {
      const configContent = fs.readFileSync(config_path)
      config = Object.assign(config, JSON.parse(configContent))
      config.firstrun = false
    } else {
      config.firstrun = true
      console.info('> Configuration file does not exists, running setup..')
    }
  }
}

config.load()

module.exports = config