const mail = require('./mail')
const { Event, Reminder, EventReminder, User, Place, Tag } = require('./model')

async function loop () {
  console.log('nel loop')
  // get all event reminder in queue
  const eventReminders = await EventReminder.findAll()
  const promises = eventReminders.map(async e => {
    const event = await Event.findByPk(e.eventId, { include: [User, Place, Tag] })
    console.log('EVENT ')
    console.log(event)
    if (!event.place) return
    const reminder = await Reminder.findByPk(e.reminderId)
    try {
      await mail.send(reminder.email, 'event', { event })
    } catch (e) {
      console.log('DENTRO CATCH!', e)
      return false
    }
    return e.destroy()
  })

  return Promise.all(promises)
}

setInterval(loop, 20000)
loop()
