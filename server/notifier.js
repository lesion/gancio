const events = require('events')

const mail = require('./api/mail')
const log = require('./log')
const fediverseHelpers = require('./federation/helpers')


const { Event, Notification, EventNotification, User, Place, Tag } = require('./api/models/models')


const settingsController = require('./api/controller/settings')

const notifier = {

  emitter: new events.EventEmitter(),

  async sendNotification (notification, event) {
    const promises = []
    log.info(`Send ${notification.type} notification ${notification.action}`)
    let p
    switch (notification.type) {
      // case 'mail': TODO: locale?
      //   return mail.send(notification.email, 'event', { event, notification })
      case 'admin_email':
        const admins = await User.findAll({ where: { role: ['admin', 'editor'], is_active: true }, attributes: ['email'], raw: true })
        let emails = [settingsController.settings.admin_email]
        emails = emails.concat(admins?.map(a => a.email))
        p = mail.send(emails, 'event',
          { event, to_confirm: !event.is_visible, notification }, undefined, true)
        promises.push(p)
        break
      case 'ap':
        p = fediverseHelpers.sendEvent(event, notification.action)
        promises.push(p)
    }
    return Promise.all(promises)
  },

  async getNotifications(event, action) {
    log.debug(`getNotifications ${event.title} ${action}`)
    function match(event, filters) {
      // matches if no filter specified
      if (!filters) { return true }

      // check for visibility
      if (typeof filters.is_visible !== 'undefined' && filters.is_visible !== event.is_visible) { return false }

      if (!filters.tags && !filters.places) { return true }
      if (!filters.tags.length && !filters.places.length) { return true }
      if (filters.tags.length) {
        const m = intersection(event.tags.map(t => t.tag), filters.tags)
        if (m.length > 0) { return true }
      }
      if (filters.places.length) {
        if (filters.places.find(p => p === event.place.name)) {
          return true
        }
      }
    }

    const notifications = await Notification.findAll({ where: { action }, include: [Event] })

    // get notification that matches with selected event
    return notifications.filter(notification => match(event, notification.filters))
  },  

  async notifyEvent (action, eventId) {

    const event = await Event.findByPk(eventId, {
      include: [Tag, Place, Notification, User]
    })
    
    notifier.emitter.emit(action, event.get({ plain: true, raw: true }))
    log.debug('[NOTIFY] %s, %s [%d]', action, event.title, event.id)

    // insert notifications
    const notifications = await notifier.getNotifications(event, action)
    await event.addNotifications(notifications)
    const event_notifications = await event.getNotifications({ through: { where: { status: 'new' } } })

    const promises = event_notifications.map(async notification => {
      try {
        await notification.event_notification.update({ status: 'sending' })
        await notifier.sendNotification(notification, event)
        notification.event_notification.status = 'sent'
      } catch (err) {
        log.error('[NOTIFY EVENT]', err)
        notification.event_notification.status = 'error'
      }
      return notification.event_notification.save()
    })
    return Promise.all(promises)
  },

  async  notify () {
    // get all event notification in queue
    const eventNotifications = await EventNotification.findAll({ where: { status: 'new' } })
    const promises = eventNotifications.map(async e => {
      const event = await Event.findByPk(e.eventId, { include: [User, Place, Tag] })
      if (!event.place) { return }
      const notification = await Notification.findByPk(e.notificationId)
      try {
        await notifier.sendNotification(notification, event)
        e.status = 'sent'
        return e.save()
      } catch (err) {
        log.error('[NOTIFY]', err)
        e.status = 'error'
        e.error = err
        return e.save()
      }
    })
    return Promise.all(promises)
  }
}

module.exports = notifier
