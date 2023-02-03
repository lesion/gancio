const Sequelize = require('sequelize')

const Umzug = require('umzug')
const path = require('path')
const config = require('../../config')
const log = require('../../log')
const SequelizeSlugify = require('sequelize-slugify')
const DB = require('./models')

const models = {
  Announcement: require('./announcement'),
  APUser: require('./ap_user'),
  Collection: require('./collection'),
  Event: require('./event'),
  EventNotification: require('./eventnotification'),
  Filter: require('./filter'),
  Instance: require('./instance'),
  Notification: require('./notification'),
  OAuthClient: require('./oauth_client'),
  OAuthCode: require('./oauth_code'),
  OAuthToken: require('./oauth_token'),
  Place: require('./place'),
  Resource: require('./resource'),
  Setting: require('./setting'),
  Tag: require('./tag'),
  User: require('./user'),
}

const db = {
  sequelize: null,
  loadModels () {
    for (const modelName in models) {
      const m = models[modelName](db.sequelize, Sequelize.DataTypes)
      DB[modelName] = m
    }

  },
  associates () {
    const { Filter, Collection, APUser, Instance, User, Event, EventNotification, Tag,
      OAuthCode, OAuthClient, OAuthToken, Resource, Place, Notification } = DB

    Filter.belongsTo(Collection)
    Collection.hasMany(Filter)

    Instance.hasMany(APUser)
    APUser.belongsTo(Instance)
    
    OAuthCode.belongsTo(User)
    OAuthCode.belongsTo(OAuthClient, { as: 'client' })
    
    OAuthToken.belongsTo(User)
    OAuthToken.belongsTo(OAuthClient, { as: 'client' })

    APUser.hasMany(Resource)
    Resource.belongsTo(APUser)

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

  },
  close() {
    if (db.sequelize) {
      return db.sequelize.close()
    }
  },
  connect(dbConf = config.db) {
    dbConf.dialectOptions = { autoJsonMap: true }
    log.debug(`Connecting to DB: ${JSON.stringify(dbConf)}`)
    if (dbConf.dialect === 'sqlite') {
      dbConf.retry = {
        match: [
          Sequelize.ConnectionError,
          Sequelize.ConnectionTimedOutError,
          Sequelize.TimeoutError,
          /Deadlock/i,
          /SQLITE_BUSY/],
        max: 15
      }
    }
    db.sequelize = new Sequelize(dbConf)
  },
  async isEmpty() {
    try {
      const users = await db.sequelize.query('SELECT * from users')
      return !(users && users.length)
    } catch (e) {
      return true
    }
  },
  async runMigrations() {
    const logging = config.status !== 'READY' ? false : log.debug.bind(log)
    const umzug = new Umzug({
      storage: 'sequelize',
      storageOptions: { sequelize: db.sequelize },
      logging,
      migrations: {
        wrap: fun => {
          return () =>
            fun(db.sequelize.queryInterface, Sequelize).catch(e => {
              // log.error(e)
              return false
            })
        },
        path: path.resolve(__dirname, '..', '..', 'migrations')
      }
    })
    return umzug.up()
  },
  initialize() {
    if (config.status === 'CONFIGURED') {
      try {
        db.connect()
        db.loadModels()
        db.associates()
      } catch (e) {
        log.warn(` ⚠️ Cannot connect to db, check your configuration => ${e}`)
        process.exit(1)
      }
    }
  }
}

module.exports = db
