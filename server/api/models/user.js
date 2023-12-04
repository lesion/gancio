
const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    settings: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    email: {
      type: DataTypes.STRING,
      unique: { msg: 'error.email_taken' },
      validate: {
        notEmpty: true
      },
      index: true,
      allowNull: false
    },
    description: DataTypes.TEXT,
    password: DataTypes.STRING,
    recover_code: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM,
      values: ['admin', 'editor', 'user'],
      defaultValue: 'user'
    },
    is_admin: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.role === 'admin'
      }
    },
    is_active: DataTypes.BOOLEAN
  }, {
    scopes: {
      withoutPassword: {
        attributes: { exclude: ['password', 'recover_code'] }
      },
      withRecover: {
        attributes: { exclude: ['password'] }
      }
    }
  })
  
  User.prototype.comparePassword = async function (pwd) {
    if (!this.password) { return false }
    return bcrypt.compare(pwd, this.password)
  }
  
  User.beforeSave(async (user, _options) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(user.password, salt)
      user.password = hash
    }
  })

  return User
}
