const path = require('path')

module.exports = {
  // environment
  env: 'development',
  locale: 'it',

  title: 'Gancio',
  description: 'Un calendario dei movimenti piemontesi',

  // base url
  baseurl: 'http://localhost:8080',
  apiurl: 'http://localhost:9000/api',


  // db configuration
  db: {
    'storage': path.join(__dirname, '/../db.sqlite'),
    'dialect': 'sqlite'
  },
  admin: 'lesion@autistici.org',

  // email configuration
  smtp: {
    host: 'mail.example.com',
    secure: true,
    auth: {
      user: 'user@example.com',
      pass: 'password'
    }
  },

  // jwt secret
  secret: 'nonosecretsuper'
}
