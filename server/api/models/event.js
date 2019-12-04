const config = require('config')
const moment = require('moment')

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
    // parent: DataTypes.INTEGER
    likes: { type: DataTypes.JSON, defaultValue: [] },
    boost: { type: DataTypes.JSON, defaultValue: [] }
  }, {})

  Event.associate = function (models) {
    Event.belongsTo(models.place)
    Event.belongsTo(models.user)
    Event.belongsToMany(models.tag, { through: 'event_tags' })
    Event.belongsToMany(models.notification, { through: 'event_notification' })
    Event.hasMany(models.resource)
  }

  Event.prototype.toNoteAP = function (username, follower = []) {
    const tags = this.tags && this.tags.map(t => t.tag.replace(/[ #]/g, ' '))
    const tag_links = tags.map(t => {
      return `<a href='/tags/${t}' class='mention hashtag status-link' rel='tag'><span>#${t}</span></a>`
    }).join(' ')

    // @todo: each instance support different note's length
    const content = `<a href='${config.baseurl}/event/${this.id}'>${this.title}</a><br/>
    📍 ${this.place.name}<br/>
    📅 ${moment.unix(this.start_datetime).format('dddd, D MMMM (HH:mm)')}<br/><br/>
      ${this.description.length > 200 ? this.description.substr(0, 200) + '...' : this.description}<br/>
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
      type: 'Note',
      // do not send attachment, in mastodon a link preview is shown instead
      // attachment,
      tag: tags.map(tag => ({
        type: 'Hashtag',
        name: '#' + tag,
        href: '/tags/' + tag
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

  return Event
}
