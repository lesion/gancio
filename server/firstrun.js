// check config.js existance
const fs = require('fs')
const consola = require('consola')

module.exports = {
  check (config_path) {
    return !fs.existsSync(config_path)
  },

  async setup (config, config_path) {
    // generate a random salt
    // consola.info('Generate random salt')
    // config.secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

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
    config.log_level = 'debug'
    consola.info(`Save configuration to ${config_path}`)
    try {
      fs.writeFileSync(config_path, JSON.stringify(config, null, 2))
    } catch (e) {
      consola.warn(` ⚠️ ${e}. You can specify configuration path using '--config'`)
    }

    // sync db
    const db = require('./api/models/index')
    const User = require('./api/models/user')
    const users = await User.findAll()
    if (users.length) {
      consola.warn(' ⚠   Non empty db! Please move your current db elsewhere than retry.')
      return false
    }

    // create admin user
    consola.info(`Create admin with email: ${admin.email}`)
    await User.create({
      email: admin.email,
      password: admin.password,
      is_admin: true,
      is_active: true
    })

    // close db connection
    await db.close()

    return true
  }
}
