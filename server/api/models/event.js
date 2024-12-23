const union = require('lodash/union')
const config = require('../../config')
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
    online_locations: { type: DataTypes.JSON, defaultValue: [] },
    ap_object: DataTypes.JSON,
    ap_id: {
      type: DataTypes.STRING,
      index: true
    }
  })
  
  Event.prototype.toAP = function (settings, to = ['https://www.w3.org/ns/activitystreams#Public'], type = 'Create') {

    const username = settings.instance_name
    const opt = {
      zone: settings.instance_timezone,
      locale: settings.instance_locale
    }

    const datetime = DateTime.fromSeconds(this.start_datetime, opt).toLocaleString({ weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
    const summary = `${this.place && this.place.name}, ${datetime}`
    
    let attachment = []

    if (this?.online_locations?.length) {
      attachment = this.online_locations.map( href => ({
        type: 'Link',
        mediaType: 'text/html',
        name: href,
        href
      }))
    }
        
    if (this?.media?.length) {
      attachment.push({
        type: 'Document',
        mediaType: 'image/jpeg',
        url: `${config.baseurl}/media/${this.media[0].url}`,
        name: this.media[0].name || this.title || '',
        focalPoint: this.media[0].focalPoint || [0, 0]
      })
    }

    let tags = this.tags.map(tag => tag.tag)
    
    // add default fedi hashtags if needed on local events only
    if (!this.ap_id && settings.default_fedi_hashtags.length) {
      tags = union(tags, settings.default_fedi_hashtags)
    }

    tags = tags?.map(tag => ({
      type: 'Hashtag',
      name: '#' + tag,
      href: `${config.baseurl}/tag/${tag}`
    })) ?? []

    return {
      id: this?.ap_id ?? `${config.baseurl}/federation/m/${this.id}`,
      name: this.title,
      url: `${config.baseurl}/event/${this.slug || this.id}`,
      type: 'Event',
      startTime: DateTime.fromSeconds(this.start_datetime, opt).toISO(),
      ...( this.end_datetime ? { endTime : DateTime.fromSeconds(this.end_datetime, opt).toISO() } : {} ),
      location: {
        id: `${config.baseurl}/federation/p/${this.place.slug}`,
        type: 'Place',
        name: this.place.name,
        address: this.place.address,
        latitude: this.place.latitude,
        longitude: this.place.longitude
      },
      attachment,
      tag: tags,
      published: this.createdAt,
      ...( type != 'Create' ? { updated: this.updatedAt } : {} ),
      attributedTo: `${config.baseurl}/federation/u/${username}`,
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: [`${config.baseurl}/federation/u/${username}/followers`],
      content: this.description || '',
      summary
    }
  }
  return Event
}