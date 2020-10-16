const config = require('config')
const moment = require('moment-timezone')
const htmlToText = require('html-to-text')

const { Model, DataTypes } = require('sequelize')
const sequelize = require('./index')

const Resource = require('./resource')
const Notification = require('./notification')
const EventNotification = require('./eventnotification')
const Place = require('./place')
const User = require('./user')
const Tag = require('./tag')

class Event extends Model {}

Event.init({
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: DataTypes.STRING,
  slug: DataTypes.STRING,
  description: DataTypes.TEXT,
  multidate: DataTypes.BOOLEAN,
  start_datetime: {
    type: DataTypes.INTEGER,
    index: true
  },
  end_datetime: {
    type: DataTypes.INTEGER,
    index: true
  },
  image_path: DataTypes.STRING,
  is_visible: DataTypes.BOOLEAN,
  recurrent: DataTypes.JSON,
  likes: { type: DataTypes.JSON, defaultValue: [] },
  boost: { type: DataTypes.JSON, defaultValue: [] }
}, { sequelize, modelName: 'event' })

Event.belongsTo(Place)
Place.hasMany(Event)

Event.belongsTo(User)
User.hasMany(Event)

Event.belongsToMany(Tag, { through: 'event_tags' })

Event.belongsToMany(Notification, { through: EventNotification })
Notification.belongsToMany(Event, { through: EventNotification })

Event.hasMany(Resource)
Resource.belongsTo(Event)

Event.hasMany(Event, { as: 'child', foreignKey: 'parentId' })
Event.belongsTo(Event, { as: 'parent' })

Event.prototype.toAP = function (username, locale, to = []) {
  const tags = this.tags && this.tags.map(t => t.tag.replace(/[ #]/g, '_'))
  const plainDescription = htmlToText.fromString(this.description.replace('\n', '').slice(0, 1000))
  const summary = `
  📍 ${this.place && this.place.name}
  📅 ${moment.unix(this.start_datetime).locale(locale).format('dddd, D MMMM (HH:mm)')}

    ${plainDescription}

    ${tags && tags.map(t => `#${t}`)}

  `

  const attachment = []
  if (this.image_path) {
    attachment.push({
      type: 'Document',
      mediaType: 'image/jpeg',
      url: `${config.baseurl}/media/${this.image_path}`,
      name: null,
      blurHash: null
    })
  }

  to.push('https://www.w3.org/ns/activitystreams#Public')

  return {
    id: `${config.baseurl}/federation/m/${this.id}`,
    name: this.title,
    url: `${config.baseurl}/event/${this.id}`,
    type: 'Note',
    startTime: moment.unix(this.start_datetime).locale(locale).format(),
    endTime: moment.unix(this.end_datetime).locale(locale).format(),
    location: {
      name: this.place && this.place.name
    },
    attachment,
    tag: tags && tags.map(tag => ({
      type: 'Hashtag',
      name: '#' + tag,
      href: '/tags/' + tag
    })),
    published: this.createdAt,
    attributedTo: `${config.baseurl}/federation/u/${username}`,
    to,
    cc: [`${config.baseurl}/federation/u/${username}/followers`],
    summary
  }
}

module.exports = Event
