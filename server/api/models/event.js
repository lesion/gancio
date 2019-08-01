const config = require('config')

module.exports = (sequelize, DataTypes) => {
  const event = sequelize.define('event', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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

  event.prototype.toAP = function (username, follower) {
    return {
      id: `${config.baseurl}/federation/m/c_${this.id}`,
      type: 'Create',
      actor: `${config.baseurl}/federation/u/${username}`,
      object: {
        id: `${config.baseurl}/federation/m/${this.id}`,
        type: 'Note',
        published: this.createdAt,
        attributedTo: `${config.baseurl}/federation/u/${username}`,
        to: 'https://www.w3.org/ns/activitystreams#Public',
        cc: follower ? follower: [],
        content: this.title
      }
    }
  }

  return event
}
