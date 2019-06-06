/**
 * GANCIO CONFIGURATION
 */
const env = process.env.NODE_ENV || 'development'

/**
 * Database configuration
 * `development` configuration is enabled running `yarn dev`
 * while `production` with `yarn start`
 * ref: http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor
 */
const DB_CONF = {
  development: {
    storage: __dirname + '/db.sqlite',
    dialect: 'sqlite',
  },
  production: {
    username: '',
    password: '',
    database: 'gancio',
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  },
}

const SECRET_CONF = {
  // where events/users confirmation email are sent
  admin: 'gancio@example.com',

  db: DB_CONF[env],

  // jwt salt secret (generate it randomly)
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
}

/**
 * Main Gancio configuration
 */
const SHARED_CONF = {
  locale: 'it',
  title: 'GANCIO',
  description: 'A calendar for radical communities',

  baseurl: env === 'development' ? 'http://localhost:3000': 'https://gancio.example.com',
  env
}

module.exports = { SHARED_CONF, SECRET_CONF }