const mail = require('./mail')
const { Event, Notification, EventNotification, User, Place, Tag } = require('./model')

async function loop () {
  // get all event notification in queue
  const eventNotifications = await EventNotification.findAll()
  const promises = eventNotifications.map(async e => {
    const event = await Event.findByPk(e.eventId, { include: [User, Place, Tag] })
    if (!event.place) return
    const notification = await Notification.findByPk(e.notificationId)
    try {
      if (notification.type === 'mail') {
        await mail.send(notification.email, 'event', { event })
      } else if (notification.type === 'mail_admin') {
        const admins = await User.findAll({ where: { is_admin: true } })
        await Promise.all(admins.map(admin =>
          mail.send(admin.email, 'event', { event, to_confirm: true, notification })))
      }
    } catch (e) {
      console.log('CATCH!', e)
      return false
    }
    return e.destroy()
  })

  return Promise.all(promises)
}

setInterval(loop, 20000)
loop()
