const Email = require('email-templates')
const path = require('path')
const moment = require('moment-timezone')
const config = require('config')
const settingsController = require('./controller/settings')
const debug = require('debug')('email')
const { Task, TaskManager } = require('../taskManager')
const locales = require('../../locales')

const mail = {
  send (addresses, template, locals, locale = settingsController.settings.instance_locale) {
    const task = new Task({
      name: 'MAIL',
      removable: true,
      method: mail._send,
      args: [addresses, template, locals, locale]
    })
    TaskManager.add(task)
  },

  _send (addresses, template, locals, locale) {
    debug(`Send ${template} email to ${addresses} with locale ${locale}`)
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
        debug('Error sending email =>', e.toString())
      })
  }
}

module.exports = mail
