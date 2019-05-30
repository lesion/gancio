const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')
const db = require('../db')

const User = db.define('user', {
  email: {
    type: Sequelize.STRING,
    unique: { msg: 'err.register_error' },
    index: true,
    allowNull: false
  },
  description: Sequelize.TEXT,
  password: Sequelize.STRING,
  recover_code: Sequelize.STRING,
  is_admin: Sequelize.BOOLEAN,
  is_active: Sequelize.BOOLEAN,
  mastodon_auth: Sequelize.JSON
})

User.prototype.comparePassword = async function (pwd) {
  if (!this.password) return false
  const ret = await bcrypt.compare(pwd, this.password)
  return ret
}

User.beforeSave(async (user, options) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(user.password, salt)
    user.password = hash
  }
})

module.exports = User
