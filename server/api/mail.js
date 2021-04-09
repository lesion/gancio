const Email = require('email-templates')
const path = require('path')
const moment = require('dayjs')
const config = require('config')
const settingsController = require('./controller/settings')
const log = require('../log')
const { Task, TaskManager } = require('../taskManager')
const locales = require('../../locales')

const mail = {
  send (addresses, template, locals, locale = settingsController.settings.instance_locale) {
    log.debug('Enqueue new email ', template, locale)
    const task = new Task({
      name: 'MAIL',
      method: mail._send,
      args: [addresses, template, locals, locale]
    })
    TaskManager.add(task)
  },

  _send (addresses, template, locals, locale) {
    log.debug(`Send ${template} email to ${addresses} with locale ${locale}`)
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
        from: `📅 ${config.title} <${config.admin_email}>`
      },
      send: true,
      i18n: {
        directory: path.join(__dirname, '..', '..', 'locales', 'email'),
        objectNotation: true,
        syncFiles: false,
        updateFiles: false,
        defaultLocale: settingsController.settings.instance_locale || 'en',
        locale,
        locales: Object.keys(locales)
      },
      transport: config.smtp
    })

    const msg = {
      template,
      message: {
        to: addresses,
        bcc: config.admin_email
      },
      locals: {
        ...locals,
        locale,
        config: { title: config.title, baseurl: config.baseurl, description: config.description, admin_email: config.admin_email },
        datetime: datetime => moment.unix(datetime).locale(locale).format('ddd, D MMMM HH:mm')
      }
    }
    return email.send(msg)
      .catch(e => {
        log.error('Error sending email =>')
        log.error(e)
      })
  }
}

module.exports = mail
