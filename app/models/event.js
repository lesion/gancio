const db = require('../db')
const Sequelize = require('sequelize')
const User = require('./user')

const Event = db.define('event', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  multidate: Sequelize.BOOLEAN,
  start_datetime: { type: Sequelize.DATE, index: true },
  end_datetime: { type: Sequelize.DATE, index: true },
  image_path: Sequelize.STRING,
  activitypub_id: { type: Sequelize.INTEGER, index: true },
  is_visible: Sequelize.BOOLEAN
})

const Tag = db.define('tag', {
  tag: { type: Sequelize.STRING, index: true, unique: true, primaryKey: true },
  color: { type: Sequelize.STRING }
})

const Comment = db.define('comment', {
  activitypub_id: { type: Sequelize.INTEGER, index: true },
  author: Sequelize.STRING,
  text: Sequelize.STRING
})

const Reminder = db.define('reminder', {
  filters: Sequelize.JSON,
  email: Sequelize.STRING,
  notify_on_add: Sequelize.BOOLEAN,
  send_reminder: Sequelize.BOOLEAN
})

const Place = db.define('place', {
  name: { type: Sequelize.STRING, unique: true, index: true },
  address: { type: Sequelize.STRING }
})

Comment.belongsTo(Event)
Event.hasMany(Comment)

Event.belongsToMany(Tag, { through: 'tagEvent' })
Tag.belongsToMany(Event, { through: 'tagEvent' })

const EventReminder = db.define('EventReminder')
Event.belongsToMany(Reminder, { through: EventReminder })
Reminder.belongsToMany(Event, { through: EventReminder })

Event.belongsTo(User)
Event.belongsTo(Place)

User.hasMany(Event)
Place.hasMany(Event)

module.exports = { Event, Comment, Tag, Place, Reminder, EventReminder }
