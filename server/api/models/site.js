const sequelize = require('./index').sequelize
const { Model, DataTypes } = require('sequelize')

class Site extends Model {}

Site.init({
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },  
  hostname: {
    type: DataTypes.STRING,
    unique: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
  // name: DataTypes.STRING,
  // description: DataTypes.STRING,
  // blocked: DataTypes.BOOLEAN,
}, { sequelize, modelName: 'sites' })

const Place = require('./place')
// const Resource = require('./resource')
const Setting = require('./setting')
const User = require('./user')
const Announcement = require('./announcement')

Site.hasMany(Place)
Place.belongsTo(Site)

Site.hasMany(Setting)
Setting.belongsTo(Site)

Site.hasMany(User)
User.belongsTo(Site)

Site.hasMany(Announcement)
Announcement.belongsTo(Site)

module.exports = Site
