const db = require('../db')
const Sequelize = require('sequelize')
const User = require('./user')

const Event = db.define('event', {
  title: Sequelize.STRING,
  description: Sequelize.STRING,
  multidate: Sequelize.BOOLEAN,
  start_datetime: { type: Sequelize.DATE, index: true},
  end_datetime: {type: Sequelize.DATE, index: true},
  image_path: Sequelize.STRING,
  activitypub_id: { type: Sequelize.INTEGER, index: true },
})

const Tag = db.define('tag', {
  tag: { type: Sequelize.STRING, index: true, unique: true, primaryKey: true},
  color: { type: Sequelize.STRING }
})

const Comment = db.define('comment', {
  activitypub_id: { type: Sequelize.INTEGER, index: true },
  author: Sequelize.STRING,
  text: Sequelize.STRING,
})

const MailSubscription = db.define('subscription' , {
  filters: Sequelize.JSON,
  mail: Sequelize.TEXT,
  send_on_add: Sequelize.BOOLEAN,
  send_reminder: Sequelize.INTEGER,
})

const Place = db.define('place', {
  name: { type: Sequelize.STRING, unique: true, index: true },
  address: { type: Sequelize.STRING }
})

Comment.belongsTo(Event)
Event.hasMany(Comment)

Event.belongsToMany(Tag, {through: 'tagEvent'})
Tag.belongsToMany(Event, {through: 'tagEvent'})

Event.belongsToMany(User, {through: 'boost'})
Event.belongsTo(User)
Event.belongsTo(Place)

User.hasMany(Event)
Place.hasMany(Event)
User.belongsToMany(User, {through: 'userFollower', as: 'follower'})

module.exports = { Event, Comment, Tag, Place }
