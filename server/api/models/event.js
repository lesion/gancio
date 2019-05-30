const Sequelize = require('sequelize')
const db = require('../db')
const User = require('./user')

const Event = db.define('event', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  multidate: Sequelize.BOOLEAN,
  start_datetime: { type: Sequelize.DATE, index: true },
  end_datetime: { type: Sequelize.DATE, index: true },
  image_path: Sequelize.STRING,
  is_visible: Sequelize.BOOLEAN,
  activitypub_id: { type: Sequelize.BIGINT, index: true },
  activitypub_ids: { 
    type: Sequelize.ARRAY(Sequelize.BIGINT),
    index: true,
    defaultValue: []
  }
})

const Tag = db.define('tag', {
  tag: { type: Sequelize.STRING, index: true, unique: true, },
  color: { type: Sequelize.STRING }
})

const Comment = db.define('comment', {
  activitypub_id: { type: Sequelize.BIGINT, index: true },
  data: Sequelize.JSON,
  // url: Sequelize.STRING,
  author: Sequelize.STRING,
  text: Sequelize.STRING
})

const Notification = db.define('notification', {
  filters: Sequelize.JSON,
  email: Sequelize.STRING,
  remove_code: Sequelize.STRING,
  type: {
    type: Sequelize.ENUM,
    values: ['mail', 'admin_email', 'mastodon']
  }
})

const Place = db.define('place', {
  name: { type: Sequelize.STRING, unique: true, index: true },
  address: { type: Sequelize.STRING }
})

Comment.belongsTo(Event)
Event.hasMany(Comment)

Event.belongsToMany(Tag, { through: 'tagEvent' })
Tag.belongsToMany(Event, { through: 'tagEvent' })

const EventNotification = db.define('EventNotification', {
  status: {
    type: Sequelize.ENUM,
    values: ['new', 'sent', 'error'],
    defaultValue: 'new',
    index: true
  }
})

Event.belongsToMany(Notification, { through: EventNotification })
Notification.belongsToMany(Event, { through: EventNotification })

Event.belongsTo(User)
Event.belongsTo(Place)

User.hasMany(Event)
Place.hasMany(Event)

async function init() {
  await Notification.findOrCreate({ where: { type: 'mastodon', filters: { is_visible: true } } })
  // await Notification.findOrCreate({ where: { type: 'admin_email', filters: { is_visible: false } } })
}

init()
module.exports = { Event, Comment, Tag, Place, Notification, EventNotification }
