const mail = require('./api/mail')
const bot = require('./api/controller/bot')
const settingsController = require('./api/controller/settings')
const config = require('./config.js')

const { Event, Notification, EventNotification,
  User, Place, Tag } = require('./api/models')
let settings

async function sendNotification(notification, event, eventNotification) {
  const promises = []
  switch (notification.type) {
    // case 'mail':
    // return mail.send(notification.email, 'event', { event, config, notification })
   case 'admin_email':
    //   const admins = await User.findAll({ where: { is_admin: true } })
    //  const admin_emails = admins.map(admin => admin.email)
     return mail.send(admin_emails, 'event', { event, to_confirm: true, notification })
    case 'mastodon':
      // instance publish
      if (settings.mastodon_auth.instance && settings.mastodon_auth.access_token) {
        const b = bot.post(settings.mastodon_auth, event).then(b => {
          event.activitypub_id = b.data.id
          // event.activitypub_ids.push(b.data.id)
          return event.save()
        })
        promises.push(b)
      }
  }
  return Promise.all(promises)
}

async function notify() {
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

let interval
function startLoop(seconds) {
  interval = setInterval(notify, seconds * 1000)
}

startLoop(26000)
