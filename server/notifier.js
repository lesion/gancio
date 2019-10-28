const mail = require('./api/mail')
// const bot = require('./api/controller/fediverse')
const config = require('config')
const debug = require('debug')('notifier')
const fediverseHelpers = require('./federation/helpers')

const { event: Event, notification: Notification, event_notification: EventNotification,
  user: User, place: Place, tag: Tag, fed_users: FedUsers } = require('./api/models')
const eventController = require('./api/controller/event')

const notifier = {
  sendNotification (notification, event) {
    const promises = []
    debug('Send %s notification %s', notification.type, notification.action)
    let p
    switch (notification.type) {
      case 'mail':
        return mail.send(notification.email, 'event', { event, config, notification })
      case 'admin_email':
        p = mail.send([config.smtp.auth.user, config.admin_email], 'event', { event, to_confirm: !event.is_visible, config, notification })
        promises.push(p)
        break
      case 'ap':
        p = fediverseHelpers.sendEvent(event, event.user, notification.action)
        promises.push(p)
    }
    return Promise.all(promises)
  },
  async notifyEvent (action, eventId) {
    const event = await Event.findByPk(eventId, {

      include: [ Tag, Place, Notification, { model: User, include: { model: FedUsers, as: 'followers' } } ]
    })

    debug('%s -> %s', action, event.title)

    // insert notifications
    const notifications = await eventController.getNotifications(event, action)
    await event.addNotifications(notifications)
    const event_notifications = await event.getNotifications()

    const promises = event_notifications.map(async notification => {
      try {
        // await notification.event_notification.update({ status: 'sending' })
        await notifier.sendNotification(notification, event)
        notification.event_notification.status = 'sent'
      } catch (err) {
        debug(err)
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
        console.error(err)
        e.status = 'error'
        // e.error = err
        return e.save()
      }
    })
    return Promise.all(promises)
  }
}

module.exports = notifier
