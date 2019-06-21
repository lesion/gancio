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

    consola.info(`Save configuration into ${config_path}`)
    fs.writeFileSync(config_path, JSON.stringify(config, null, 2))

    // sync db (TODO, check if there's something in db and ask to backup)
    const db = require('./api/models')
    try {
      consola.info(`Create tables..`)
      await db.sequelize.sync({force: true})
    } catch(e) {
      consola.error('Error creating tables', e)
      return -1
    }

    // create admin user
    consola.info('Create admin user')
    await db.user.create({
      email: config.admin.email,
      password: config.admin.password,
      is_admin: true,
      is_active: true
    })

    const settings = require('./api/controller/settings')
    settings.set('enable_registration', true)
    settings.set('allow_anon_event', true)
    settings.set('allow_mastodon_association', true)

  }
}