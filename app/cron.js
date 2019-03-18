const mail = require('./mail')
const bot = require('./controller/bot')
const settingsController = require('./controller/settings')

const { Event, Notification, EventNotification,
  User, Place, Tag } = require('./model')
let settings

async function sendNotification (notification, event, eventNotification) {
  const promises = []
  try {
    switch (notification.type) {
      case 'mail':
        const p = mail.send(notification.email, 'event', { event })
        promises.push(p)
        break
      case 'admin_email':
        const admins = await User.findAll({ where: { is_admin: true } })
        promises.push(admins.map(admin =>
          mail.send(admin.email, 'event', { event, to_confirm: true, notification })))
        break
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
  } catch (e) {
    console.log('CATCH!', e)
    return false
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
      e.save()
    } catch (e) {
      console.error(e)
      e.status = 'error'
      return e.save()
    }
  })

  return Promise.all(promises)
}

setInterval(loop, 260000)
loop()
