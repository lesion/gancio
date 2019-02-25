module.exports = {
  // environment
  env: 'production',
  locale: 'en',

  title: 'Put here your site name',
  description: 'A calendar for radical communities',

  // base url
  baseurl: 'https://example.com',
  apiurl: 'https://example.com/api',

  // db configuration
  db: {
  },
  admin: 'admin@example.com',

  // email configuration
  smtp: {
    host: 'mail.example.com',
    secure: true,
    auth: {
      user: 'admin@example.com',
      pass: ''
    }
  },

  // jwt secret
  secret: 'randomstringhere'
}
