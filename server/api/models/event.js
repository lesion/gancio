const config = require('../../config')
const { htmlToText } = require('html-to-text')
const dayjs = require('dayjs')
const timezone = require('dayjs/plugin/timezone')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)
dayjs.extend(timezone)

// class Event extends Model {}
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('event', {
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
  })
  
  Event.prototype.toAP = function (username, locale, to = []) {
    const tags = this.tags && this.tags.map(t => t.tag.replace(/[ #]/g, '_'))
    const plainDescription = htmlToText(this.description && this.description.replace('\n', '').slice(0, 1000))
    const content = `
    📍 ${this.place && this.place.name}
    📅 ${dayjs.unix(this.start_datetime).tz().locale(locale).format('dddd, D MMMM (HH:mm)')}
    
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
      startTime: dayjs.unix(this.start_datetime).tz().locale(locale).format(),
      ...( this.end_datetime ? { endTime : dayjs.unix(this.end_datetime).tz().locale(locale).format() } : {} ),
      location: {
        name: this.place.name,
        address: this.place.address,
        latitude: this.place.latitude,
        longitude: this.place.longitude
      },
      attachment,
      tag: tags && tags.map(tag => ({
        type: 'Hashtag',
        name: '#' + tag,
        href: `${config.baseurl}/tag/${tag}`
      })),
      published: dayjs(this.createdAt).utc().format(),
      attributedTo: `${config.baseurl}/federation/u/${username}`,
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: [`${config.baseurl}/federation/u/${username}/followers`],
      content,
      summary: content
    }
  }
  return Event
}