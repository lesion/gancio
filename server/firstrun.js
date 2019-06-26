// check config.js existance
const fs = require('fs')
const consola = require('consola')

module.exports = {
  check (config_path) {
    return !fs.existsSync(config_path)
  },

  async setup (config, config_path) {
    // generate a random salt
    consola.info('Generate random salt')
    config.secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const admin = { email: config.admin.email, password: config.admin.password }
    delete config.admin
    config.admin_email = admin.email
    consola.info(`Save configuration into ${config_path}`)
    fs.writeFileSync(config_path, JSON.stringify(config, null, 2))

    // sync db
    const db = require('./api/models')
    try {
      await db.user.findAll()
      consola.warning(`!WARNING! Non empty db!`)
      return -1
    } catch(e) {}

    await db.sequelize.sync({force: true}).catch(e => {
      consola.error('Error creating tables', e)
      return -1
    })

    // create admin user
    consola.info('Create admin user')
    await db.user.create({
      ...admin,
      is_admin: true,
      is_active: true
    })

    
    // set default settings
    consola.info('Set default settings')
    const settings = require('./api/controller/settings')
    await settings.set('allow_registration', true)
    await settings.set('allow_anon_event', true)

    // add default notification
    consola.info('Add default notification')

    // send confirmed event to mastodon
    await db.notification.create({ type: 'mastodon', filters: { is_visible: true } })

    // send every event to admin
    await db.notification.create({ type: 'admin_email' })
  }
}