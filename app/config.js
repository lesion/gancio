let db = {}
if (process.env.NODE_ENV==='production') {
  db = {
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    dialect: 'postgres'
  }
} else {
  db = {
    dialect: 'sqlite',
    storage: './db.sqlite'
  }
}

module.exports = {
  locale: 'en',

  title: process.env.TITLE || 'Put here your site name',
  description: process.env.DESCRIPTION || 'A calendar for radical communities',

  baseurl: process.env.BASE_URL || 'http://localhost:8080',
  apiurl: process.env.API_URL || 'http://localhost:9000',
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

  secret: process.env.SMTP_SECRET
}
