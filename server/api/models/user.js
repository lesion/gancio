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
    is_admin: DataTypes.BOOLEAN,
    is_active: DataTypes.BOOLEAN
  }, {
    scopes: {
      withoutPassword: {
        attributes: { exclude: ['password', 'recover_code'] }
      }
    }
  })

  User.associate = function (models) {
    User.hasMany(models.event)
  }

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

  return User
}
