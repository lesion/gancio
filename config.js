/**
 * GANCIO CONFIGURATION
 */
const env = process.env.NODE_ENV || 'development'


console.log(__dirname + '/db.sqlite')
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
    logging: false
  },
  production: {
    storage: __dirname + '/db.sqlite',
    dialect: 'sqlite',
    logging: false    
    // username: 'docker',
    // password: 'docker',
    // database: 'gancio',
    // host: 'db',
    // dialect: 'postgres',
    // logging: false
  }
}


/**
 * Main Gancio configuration
 */
const GANCIO_CONF = {
  locale: 'it',
  title: 'GANCIO',
  description: 'A calendar for radical communities',
  baseurl: '',
  db: DB_CONF[env],

  admin_email: process.env.ADMIN_EMAIL,

  smtp: {
    host: process.env.SMTP_HOST,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },

  secret: 'notsosecret'
}

module.exports = GANCIO_CONF