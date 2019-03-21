const Email = require('email-templates')
const path = require('path')
const config = require('./config')
const moment = require('moment')
moment.locale('it')

const mail = {
  send (addresses, template, locals) {
    const email = new Email({
      views: { root: path.join(__dirname, 'emails') },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, 'emails')
        }
      },
      message: {
        from: `${config.title} <${config.smtp.auth.user}>`
      },
      send: true,
      i18n: {
        locales: ['en', 'es', 'it'],
        defaultLocale: config.locale
      },
      transport: config.smtp
    })
    return email.send({
      template,
      message: {
        to: addresses,
        bcc: config.admin
      },
      locals: {
        ...locals,
        locale: config.locale,
        config,
        datetime: datetime => moment(datetime).format('ddd, D MMMM HH:mm')
      }
    })
  }
}

module.exports = mail
