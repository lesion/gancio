const Email = require('email-templates')
const path = require('path')
const config = require('./config');

const mail = {
  send (addresses, template, locals) {
    locals.locale = config.locale
    const email = new Email({
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, '..', 'emails')
        }
      },
      message: {
        from: 'Gancio <eventi@cisti.org>'
      },
      send: true,
      i18n: {},
      transport: config.smtp
    })
    return email.send({
      template,
      message: {
        to: addresses,
        bcc: config.admin
      },
      locals
    })
  }
}

module.exports = mail
