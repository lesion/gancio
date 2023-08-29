const Email = require('email-templates')
const path = require('path')
const { DateTime } = require('luxon')
const settingsController = require('./controller/settings')
const log = require('../log')
const { Task, TaskManager } = require('../taskManager')
const locales = require('../../locales')

const mail = {
  send (addresses, template, locals, locale) {
    locale = locale || settingsController.settings.instance_locale
    if (process.env.NODE_ENV === 'production' && (!settingsController.settings.admin_email || !settingsController.settings.smtp)) {
      log.error(`Cannot send any email: SMTP Email configuration not completed!`)
      return
    }
    log.debug(`Enqueue new email ${template} ${locale}`)
    const task = new Task({
      name: 'MAIL',
      method: mail._send,
      args: [addresses, template, locals, locale]
    })
    TaskManager.add(task)
  },

  _send (addresses, template, locals, locale) {
    locale = locale || settingsController.settings.instance_locale
    const settings = settingsController.settings
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
        from: `"📅 ${settings.title}" <${settings.admin_email}>`
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
      transport: settings.smtp || {}
    })

    const opt = {
      zone: settings.instance_timezone,
      locale
    }

    const msg = {
      template,
      message: {
        to: addresses
      },
      locals: {
        ...locals,
        locale,
        config: { title: settings.title, baseurl: settings.baseurl, description: settings.description, admin_email: settings.admin_email },
        datetime: timestamp => DateTime.fromSeconds(timestamp, opt).toFormat('EEEE, d MMMM HH:mm')
      }
    }
    return email.send(msg)
      .catch(e => {
        log.error('[MAIL]', e)
        throw e
      })
  }
}

module.exports = mail
