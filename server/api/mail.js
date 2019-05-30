const Email = require('email-templates')
const path = require('path')
const { SECRET_CONF, SHARED_CONF } = require('../../config')
const moment = require('moment')
moment.locale(SHARED_CONF.locale)

const mail = {
  send (addresses, template, locals) {
    const email = new Email({
      views: { root: path.join(__dirname, '..', 'emails') },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, '..', 'emails')
        }
      },
      message: {
        from: `${SHARED_CONF.title} <${SECRET_CONF.smtp.auth.user}>`
      },
      send: true,
      i18n: {
        directory: path.join(__dirname, '..', '..', 'locales', 'email'),
        defaultLocale: SHARED_CONF.locale
      },
      transport: SECRET_CONF.smtp
    })
    return email.send({
      template,
      message: {
        to: addresses,
        bcc: SECRET_CONF.admin
      },
      locals: {
        ...locals,
        locale: SHARED_CONF.locale,
        config: SHARED_CONF,
        datetime: datetime => moment(datetime).format('ddd, D MMMM HH:mm')
      }
    })
  }
}

module.exports = mail
