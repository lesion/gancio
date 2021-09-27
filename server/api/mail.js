const Email = require('email-templates')
const path = require('path')
const moment = require('dayjs')
const config = require('../config')
const settings = require('./controller/settings').settings
const log = require('../log')
const { Task, TaskManager } = require('../taskManager')
const locales = require('../../locales')

const mail = {
  send (addresses, template, locals, locale = settings.instance_locale) {
    log.debug('Enqueue new email ', template, locale)
    const task = new Task({
      name: 'MAIL',
      method: mail._send,
      args: [addresses, template, locals, locale]
    })
    TaskManager.add(task)
  },

  _send (addresses, template, locals, locale) {
    log.info(`Send ${template} email to ${addresses} with locale ${locale}`)
    const email = new Email({
      views: { root: path.join(__dirname, '..', 'emails') },
      htmlToText: true,
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, '..', 'emails')
        }
      },
      message: {
        from: `📅 ${settings.title} <${settings.admin_email}>`
      },
      send: true,
      i18n: {
        directory: path.join(__dirname, '..', '..', 'locales', 'email'),
        objectNotation: true,
        syncFiles: false,
        updateFiles: false,
        defaultLocale: settings.instance_locale || 'en',
        locale,
        locales: Object.keys(locales)
      },
      transport: settings.smtp
    })

    const msg = {
      template,
      message: {
        to: addresses,
        bcc: settings.admin_email
      },
      locals: {
        ...locals,
        locale,
        config: { title: settings.title, baseurl: settings.baseurl, description: settings.description, admin_email: settings.admin_email },
        datetime: datetime => moment.unix(datetime).locale(locale).format('ddd, D MMMM HH:mm')
      }
    }
    return email.send(msg)
      .catch(e => {
        log.error('[MAIL]', e)
      })
  }
}

module.exports = mail
