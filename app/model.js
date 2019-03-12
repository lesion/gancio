const User = require('./models/user')
const { Event, Comment, Tag, Place, Notification, EventNotification } = require('./models/event')
const Settings = require('./models/settings')

module.exports = {
  User,
  Event,
  Comment,
  Tag,
  Place,
  Notification,
  EventNotification,
  Settings
}
