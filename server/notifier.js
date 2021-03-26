const mail = require('./api/mail')
const config = require('config')
const log = require('./log')
const fediverseHelpers = require('./federation/helpers')

const Event = require('./api/models/event')
const Notification = require('./api/models/notification')
const EventNotification = require('./api/models/eventnotification')
const User = require('./api/models/user')
const Place = require('./api/models/place')
const Tag = require('./api/models/tag')

const eventController = require('./api/controller/event')

const notifier = {

  sendNotification (notification, event) {
    const promises = []
    log.debug(`Send ${notification.type} notification ${notification.action}`)
    let p
    switch (notification.type) {
      // case 'mail': TODO: locale?
      //   return mail.send(notification.email, 'event', { event, notification })
      case 'admin_email':
        p = mail.send(config.admin_email, 'event',
          { event, to_confirm: !event.is_visible, notification })
        promises.push(p)
        break
      case 'ap':
        p = fediverseHelpers.sendEvent(event, notification.action)
        promises.push(p)
    }
    return Promise.all(promises)
  },

  async notifyEvent (action, eventId) {
    const event = await Event.findByPk(eventId, {
      include: [Tag, Place, Notification, User]
    })

    log.debug(action, event.title)

    // insert notifications
    const notifications = await eventController.getNotifications(event, action)
    await event.addNotifications(notifications)
    const event_notifications = await event.getNotifications()

    const promises = event_notifications.map(async notification => {
      try {
        await notification.event_notification.update({ status: 'sending' })
        await notifier.sendNotification(notification, event)
        notification.event_notification.status = 'sent'
      } catch (err) {
        log.error(err)
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
        log.error(err)
        e.status = 'error'
        e.error = err
        return e.save()
      }
    })
    return Promise.all(promises)
  }
}

module.exports = notifier
