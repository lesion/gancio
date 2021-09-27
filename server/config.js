const fs = require('fs')
const path = require('path')
const log = require('./log')

let config = {
  firstrun: true,
  // title: "Gancio",
  // description: "A shared agenda for local communities",
  baseurl: "http://localhost:13120",
  server: {
    host: '127.0.0.1',
    port: 13120
  },
  log_level: 'debug',
  log_path: './logs',
  db: {},
  upload_path: './uploads',
  // smtp: {
  //   auth: {
  //     user: '',
  //     pass: ''
  //   },
  //   secure: true,
  //   host: ''
  // },
  // admin_email: '',

  // 
  write (config_path= process.env.config_path || './config.json') {
    log.error(path.resolve(config_path))
    return fs.writeFileSync(config_path, JSON.stringify(config, null, 2))
  },

  load () {
    // load configuration from file
    console.error(process.env.NODE_ENV)
    const config_path = process.env.config_path || './config.json'
    log.info(`Reading configuration from: ${config_path}`)
    if (fs.existsSync(config_path)) {
      const configContent = fs.readFileSync(config_path)
      config = Object.assign(config, JSON.parse(configContent))
      config.firstrun = false
    } else {
      config.firstrun = true
      log.error('configuration file does not exists! we cannot be here!')
    }
  }
}

config.load()

module.exports = config