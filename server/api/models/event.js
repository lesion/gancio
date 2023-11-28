const config = require('../../config')
const { htmlToText } = require('html-to-text')
const { DateTime } = require('luxon')

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
    boost: { type: DataTypes.JSON, defaultValue: [] },
    online_locations: { type: DataTypes.JSON, defaultValue: [] }
  })
  
  Event.prototype.toAP = function (settings, to = []) {

    const username = settings.instance_name
    const opt = {
      zone: settings.instance_timezone,
      locale: settings.instance_locale
    }
    const tags = this.tags && this.tags.map(t => t.tag.replace(/[ #]/g, '_'))
    const content = htmlToText(this.description || '')
    const summary = `
    📍 ${this.place && this.place.name}
    📅 ${DateTime.fromSeconds(this.start_datetime, opt).toFormat('EEEE, d MMMM (HH:mm)')}
    
    ${content.slice(0, 1000)}
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
      startTime: DateTime.fromSeconds(this.start_datetime, opt).toISO(),
      ...( this.end_datetime ? { endTime : DateTime.fromSeconds(this.end_datetime, opt).toISO() } : {} ),
      location: {
        type: 'Place',
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
      published: this.createdAt,
      attributedTo: `${config.baseurl}/federation/u/${username}`,
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: [`${config.baseurl}/federation/u/${username}/followers`],
      content,
      summary
    }
  }
  return Event
}