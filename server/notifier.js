const mail = require('./api/mail')
// const bot = require('./api/controller/fediverse')
const settingsController = require('./api/controller/settings')
const config = require('config')
const eventController = require('./api/controller/event')
const get = require('lodash/get')

const { event: Event, notification: Notification,  event_notification: EventNotification,
  user: User, place: Place, tag: Tag } = require('./api/models')

const notifier = {
  async sendNotification(notification, event) {
    return
    const promises = []
    switch (notification.type) {
      case 'mail':
      return mail.send(notification.email, 'event', { event, config, notification })
     case 'admin_email':
       return mail.send([config.smtp.auth.user, config.admin_email], 'event', { event, to_confirm: !event.is_visible, config, notification })
      // case 'mastodon':
      //   // instance publish
      //   if (bot.bot) {
      //     const b = bot.post(event).then(b => {
      //       event.activitypub_id = String(b.data.id)
      //       return event.save()
      //     }).catch(e => {
      //       console.error("ERROR !! ", e)
      //     })
      //     promises.push(b)
      //   }
    }
    return Promise.all(promises)
  },
  async notifyEvent(eventId) {
    const event = await Event.findByPk(eventId, {
      include: [ Tag, Place, User ]
    })

    // insert notifications
    const notifications = await eventController.getNotifications(event)
    const a = await event.setNotifications(notifications)

    const eventNotifications = await EventNotification.findAll({
      where: {
        notificationId: notifications.map(n=>n.id),
        status: 'new'
      }
    })

    const promises = eventNotifications.map(async e => {
      const notification = await Notification.findByPk(e.notificationId)
      try {
        await notifier.sendNotification(notification, event)
        e.status = 'sent'
      } catch (err) {
        e.status = 'error'
      }
      return e.save()
    })
  
    return Promise.all(promises)
  },
  async  notify() {
    // get all event notification in queue
    const eventNotifications = await EventNotification.findAll({ where: { status: 'new' } })
    const promises = eventNotifications.map(async e => {
      const event = await Event.findByPk(e.eventId, { include: [User, Place, Tag] })
      if (!event.place) return
      const notification = await Notification.findByPk(e.notificationId)
      try {
        await sendNotification(notification, event, e)
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