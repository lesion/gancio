const config = require('config')
const moment = require('moment')

module.exports = (sequelize, DataTypes) => {
  const event = sequelize.define('event', {
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
    // parent: DataTypes.INTEGER
    likes: { type: DataTypes.JSON, defaultValue: [] },
    boost: { type: DataTypes.JSON, defaultValue: [] }
  }, {})

  event.associate = function (models) {
    event.belongsTo(models.place)
    event.belongsTo(models.user)
    event.belongsToMany(models.tag, { through: 'event_tags' })
    event.belongsToMany(models.notification, { through: 'event_notification' })
    event.hasMany(models.comment)
  }

  event.prototype.toAP = function (username, follower = []) {
    const tags = this.tags && this.tags.map(t => {
      const tag = t.tag.replace(/[ #]/g, '_')
      return `<a href='/tags/${t.tag}' class='mention hashtag status-link' rel='tag'><span>#${t.tag}</span></a>`
    }).join(' ')

    const content = `<a href='${config.baseurl}/event/${this.id}'>${this.title}</a><br/>
    📍${this.place.name}<br/>
    ⏰ ${moment.unix(this.start_datetime).format('dddd, D MMMM (HH:mm)')}<br/><br/>
      ${this.description.length > 200 ? this.description.substr(0, 200) + '...' : this.description}<br/>
      ${tags} <br/>`

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
      type: 'Note',
      // attachment,
      tag: this.tags.map(tag => ({
        type: 'Hashtag',
        name: '#' + tag.tag,
        href: '/tags/' + tag.tag
      })),
      published: this.createdAt,
      attributedTo: `${config.baseurl}/federation/u/${username}`,
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: follower || [],
      content,
      summary: null,
      sensitive: false
    }
  }

  return event
}
