
const bcrypt = require('bcryptjs')
const { Model, DataTypes } = require('sequelize')
const sequelize = require('./index')

class User extends Model {}

User.init({
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
  is_admin: DataTypes.BOOLEAN,
  is_active: DataTypes.BOOLEAN
}, {
  sequelize,
  modelName: 'user',
  scopes: {
    withoutPassword: {
      attributes: { exclude: ['password', 'recover_code'] }
    }
  }
})

User.prototype.comparePassword = async function (pwd) {
  if (!this.password) { return false }
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
