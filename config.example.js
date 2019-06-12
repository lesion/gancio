/**
 * -[ GANCIO CONFIGURATION ]-
 *
 *  search and replace 'CHANGE ME'
 *
 * -[ Database configuration ]-
 * `development` configuration is enabled running `yarn dev`
 * while `production` with `yarn start`
 * ref: http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor
 *
 */
const path = require('path')

const DB_CONF = {
  development: {
    storage: path.join(__dirname, 'db.sqlite'),
    dialect: 'sqlite'
  },
  production: {
    username: 'CHANGE ME',
    password: 'CHANGE ME',
    database: 'gancio',
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  }
}

const env = process.env.NODE_ENV || 'development'
const isDev = env === 'development'
/**
 * -[ Main configuration ]-
 *
 */
const config = {
  server: {
    port: '3000',
    host: 'localhost', // use 0.0.0.0 to bind to all interface

    // uncomment to use unix socket to serve gancio
    // path: '/tmp/gancio_socket',
  },

  locale: 'it',
  title: isDev ? 'GANCIO' : 'CHANGE ME',
  description: isDev ? 'A shared agenda for radical communities' : 'CHANGE ME',
  baseurl: isDev ? 'http://localhost:3000' : 'https://CHANGE_ME',

  upload_path: isDev ? '/tmp/gancio_upload' : '/var/gancio/upload/',

  // where events/users confirmation email are sent
  admin: 'CHANGE ME',

  // jwt salt secret, generate it randomly with
  // < /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-32};echo;
  secret: isDev ? 'notreallyrandom' : 'CHANGE ME',

  // smtp account to send email
  smtp: {
    host: 'CHANGE ME', // mail.example.com
    auth: {
      user: 'CHANGE ME',
      pass: 'CHANGE ME'
    },
    secure: true
  },
  db: DB_CONF[env]
}

module.exports = { ...config, ...config.db }
