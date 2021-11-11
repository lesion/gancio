const config = require('../../config')
const moment = require('dayjs')
const { htmlToText } = require('html-to-text')

const { Model, DataTypes } = require('sequelize')
const SequelizeSlugify = require('sequelize-slugify')

const sequelize = require('./index').sequelize

const Resource = require('./resource')
const Notification = require('./notification')
const EventNotification = require('./eventnotification')
const Place = require('./place')
const User = require('./user')
const Tag = require('./tag')

const utc = require('dayjs/plugin/utc')
const dayjs = require('dayjs')
dayjs.extend(utc)

class Event extends Model {}

Event.init({
  id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: DataTypes.STRING,
  slug: {
    type: DataTypes.STRING,
    index: true,
    unique: true
  },
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
  media: DataTypes.JSON,
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
Tag.belongsToMany(Event, { through: 'event_tags' })

Event.belongsToMany(Notification, { through: EventNotification })
Notification.belongsToMany(Event, { through: EventNotification })

Event.hasMany(Resource)
Resource.belongsTo(Event)

Event.hasMany(Event, { as: 'child', foreignKey: 'parentId' })
Event.belongsTo(Event, { as: 'parent' })

SequelizeSlugify.slugifyModel(Event, { source: ['title'], overwrite: false })

Event.prototype.toAP = function (username, locale, to = []) {
  const tags = this.tags && this.tags.map(t => t.tag.replace(/[ #]/g, '_'))
  const plainDescription = htmlToText(this.description && this.description.replace('\n', '').slice(0, 1000))
  const content = `
    📍 ${this.place && this.place.name}
    📅 ${moment.unix(this.start_datetime).locale(locale).format('dddd, D MMMM (HH:mm)')}

    ${plainDescription}
  `

  const attachment = []
  if (this.media && this.media.length) {
    attachment.push({
      type: 'Document',
      mediaType: 'image/jpeg',
      url: `${config.baseurl}/media/${this.media[0].url}`,
      name: this.media[0].name || this.title || '',
      blurHash: null,
      focalPoint: this.media[0].focalPoint || [0, 0]
    })
  }


  return {
    id: `${config.baseurl}/federation/m/${this.id}`,
    name: this.title,
    url: `${config.baseurl}/event/${this.slug || this.id}`,
    type: 'Event',
    startTime: moment.unix(this.start_datetime).locale(locale).format(),
    endTime: this.end_datetime ? moment.unix(this.end_datetime).locale(locale).format() : null,
    location: {
      name: this.place.name,
      address: this.place.address
    },
    attachment,
    tag: tags && tags.map(tag => ({
      type: 'Hashtag',
      name: '#' + tag,
      href: '/tags/' + tag
    })),
    published: dayjs(this.createdAt).utc().format(),
    attributedTo: `${config.baseurl}/federation/u/${username}`,
    to: ['https://www.w3.org/ns/activitystreams#Public'],
    cc: [`${config.baseurl}/federation/u/${username}/followers`],
    content,
    summary: content
  }
}

module.exports = Event
