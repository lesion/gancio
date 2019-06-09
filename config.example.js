const path = require('path')

/**
 * -[ GANCIO CONFIGURATION ]-
 *
 * -[ Database configuration ]-
 * `development` configuration is enabled running `yarn dev`
 * while `production` with `yarn start`
 * ref: http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor
 *
 */

const DB_CONF = {
  development: {
    storage: path.join(__dirname, 'db.sqlite'),
    dialect: 'sqlite'
  },
  production: {
    username: '',
    password: '',
    database: 'gancio',
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  }
}

const env = process.env.NODE_ENV || 'development'

/**
 * -[ Main configuration ]-
 *
 */
const config = {
  server: {
    port: '3000',
    host: '0',
    // uncomment to use unix socket to serve gancio
    // path: '/tmp/gancio_socket',
  },
  locale: 'it',
  title: 'GANCIO',
  description: 'A shared agenda for radical communities',
  baseurl: '' || 'http://localhost:3000',

  // where events/users confirmation email are sent
  admin: '',

  // jwt salt secret, generate it randomly with
  // < /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-32};echo;
  secret: '',

  // smtp account to send email
  smtp: {
    host: process.env.SMTP_HOST || 'mail.example.com',
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'gancio@example.com',
      pass: process.env.SMTP_PASS || ''
    }
  },
  db: DB_CONF[env]
}

module.exports = config
