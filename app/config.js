/* backend configuration */
const env = process.env.NODE_ENV || 'development'
const db = require('./config/config.json')[env]

module.exports = {
  locale: process.env.LOCALE || 'it',
  title: process.env.TITLE || 'GANCIO',
  description: process.env.DESCRIPTION || 'A calendar for radical communities',
  baseurl: process.env.BASE_URL || 'http://localhost:8080',
  apiurl: env === 'production' ? process.env.BASE_URL + '/api' : 'http://localhost:9000',
  db,
  admin: process.env.ADMIN_EMAIL,

  smtp: {
    host: process.env.SMTP_HOST,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },

  secret: process.env.SECRET || 'notsosecret'
}
