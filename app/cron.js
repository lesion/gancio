const mail = require('./mail')
const bot = require('./controller/bot')
const settingsController = require('./controller/settings')
const config = require('./config.js')

const { Event, Notification, EventNotification,
  User, Place, Tag } = require('./model')
let settings

async function sendNotification (notification, event, eventNotification) {
  const promises = []
  switch (notification.type) {
    case 'mail':
      return mail.send(notification.email, 'event', { event, config, notification })
    case 'admin_email':
      const admins = await User.findAll({ where: { is_admin: true } })
      const admin_emails = admins.map(admin => admin.email)
      return mail.send(admin_emails, 'event', { event, to_confirm: true, notification })
    case 'mastodon':
      // instance publish
      if (settings.mastodon_auth.instance && settings.mastodon_auth.access_token) {
        const b = bot.post(settings.mastodon_auth, event)
        promises.push(b)
      }
      // user publish
      if (event.user && event.user.mastodon_auth && event.user.mastodon_auth.access_token) {
        const b = bot.post(event.user.mastodon_auth, event).then(ret => {
          event.activitypub_id = ret.id
          return event.save()
        })
        promises.push(b)
      }
      break
  }
  return Promise.all(promises)
}

async function loop () {
  settings = await settingsController.settings()
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
      return e.save()
    }
  })

  return Promise.all(promises)
}

setInterval(loop, 260000)
loop()
