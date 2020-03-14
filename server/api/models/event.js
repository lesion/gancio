const config = require('config')
const moment = require('moment-timezone')

module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('event', {
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
  }, {})

  Event.associate = function (models) {
    Event.belongsTo(models.place)
    Event.belongsTo(models.user)
    Event.belongsToMany(models.tag, { through: 'event_tags' })
    Event.belongsToMany(models.notification, { through: 'event_notification' })
    Event.hasMany(models.resource)
    Event.hasMany(Event, { as: 'child', foreignKey: 'parentId' })
    Event.belongsTo(models.event, { as: 'parent' })
  }

  Event.prototype.toAP = function (username, locale, follower = []) {
    const tags = this.tags && this.tags.map(t => t.tag.replace(/[ #]/g, '_'))
    const tag_links = tags.map(t => {
      return `<a href='/tags/${t}' class='mention hashtag status-link' rel='tag'><span>#${t}</span></a>`
    }).join(' ')

    const content = `<a href='${config.baseurl}/event/${this.id}'>${this.title}</a><br/>
    📍 ${this.place.name}<br/>
    📅 ${moment.unix(this.start_datetime).locale(locale).format('dddd, D MMMM (HH:mm)')}<br/><br/>
      ${this.description.length > 500 ? this.description.substr(0, 500) + '...' : this.description}<br/>
      ${tag_links} <br/>`

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

    return {
      id: `${config.baseurl}/federation/m/${this.id}`,
      url: `${config.baseurl}/federation/m/${this.id}`,
      type: 'Event',
      attachment,
      tag: tags.map(tag => ({
        type: 'Hashtag',
        name: '#' + tag,
        href: '/tags/' + tag
      })),
      published: this.createdAt,
      attributedTo: `${config.baseurl}/federation/u/${username}`,
      to: follower || [],
      cc: ['https://www.w3.org/ns/activitystreams#Public', `${config.baseurl}/federation/u/${username}/followers`],
      content,
      summary: null,
      sensitive: false
    }
  }

  return Event
}
