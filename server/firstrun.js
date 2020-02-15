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

    // do not save admin's password in config file
    const admin = { email: config.admin.email, password: config.admin.password }
    delete config.admin

    if (config.smtp_type === 'sendmail') {
      config.smtp = {
        sendmail: true,
        newline: 'unix',
        path: config.smtp.path
      }
    }
    delete config.smtp_type
    delete config.smtp_need_auth
    config.admin_email = admin.email
    config.db.logging = false
    consola.info(`Save configuration to ${config_path}`)
    try {
      fs.writeFileSync(config_path, JSON.stringify(config, null, 2))
    } catch (e) {
      consola.warn(` ⚠️ ${e}. You can specify configuration path using '--config'`)
    }

    // sync db
    const db = require('./api/models')
    const users = await db.user.findAll()
    if (users.length) {
      consola.warn(' ⚠   Non empty db! Please move your current db elsewhere than retry.')
      return false
    }

    // create admin user
    consola.info(`Create admin with email: ${admin.email}`)
    await db.user.create({
      email: admin.email,
      password: admin.password,
      is_admin: true,
      is_active: true
    })

    // add default notification
    consola.info('Add default notification')

    // send confirmed event to mastodon
    await db.notification.create({ action: 'Create', type: 'ap', filters: { is_visible: true } })
    await db.notification.create({ action: 'Update', type: 'ap', filters: { is_visible: true } })
    await db.notification.create({ action: 'Delete', type: 'ap', filters: { is_visible: true } })

    // send anon event to administrator
    await db.notification.create({ action: 'Create', type: 'admin_email', filters: { is_visible: false } })

    // TODO
    // await db.notification.create({ action: 'Create', type: 'email', filters: { is_visible: true } })

    // close db connection
    await db.sequelize.close()

    return true
  }
}
