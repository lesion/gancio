/* backend configuration */
let db = {}
let apiurl

if (process.env.NODE_ENV === 'production') {
  db = {
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    dialect: 'postgres'
  }
  apiurl = process.env.BASE_URL + '/api'
} else {
  db = {
    dialect: 'sqlite',
    storage: './db.sqlite'
  }
  apiurl = 'http://localhost:9000'
}

module.exports = {
  locale: 'it',

  title: process.env.TITLE || 'GANCIO',
  description: process.env.DESCRIPTION || 'A calendar for radical communities',

  baseurl: process.env.BASE_URL || 'http://localhost:8080',
  apiurl,
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
