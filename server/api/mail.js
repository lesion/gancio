const Email = require('email-templates')
const path = require('path')
const moment = require('moment')
const config = require('../config')

moment.locale(config.SHARED_CONF.locale)
const mail = {
  send(addresses, template, locals) {
    const email = new Email({
      views: { root: path.join(__dirname, '..', 'emails') },
      htmlToText: false,
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, '..', 'emails')
        }
      },
      message: {
        from: `${config.SHARED_CONF.title} <${config.SECRET_CONF.smtp.auth.user}>`
      },
      send: true,
      i18n: {
        directory: path.join(__dirname, '..', '..', 'locales', 'email'),
        defaultLocale: config.SHARED_CONF.locale
      },
      transport: config.SECRET_CONF.smtp
    })
    const msg = {
      template,
      message: {
        to: addresses,
        bcc: config.SECRET_CONF.admin
      },
      locals: {
        ...locals,
        locale: config.SHARED_CONF.locale,
        config: config.SHARED_CONF,
        datetime: datetime => moment(datetime).format('ddd, D MMMM HH:mm')
      }
    }
    return email.send(msg)
      .catch(e => {
        console.error(e)
      })
  }
}

module.exports = mail
