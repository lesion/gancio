'use strict'
const bcrypt = require('bcrypt')

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      unique: true,
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

  user.associate = function (models) {
    // associations can be defined here
    user.hasMany(models.event)
  }

  user.prototype.comparePassword = async function (pwd) {
    if (!this.password) return false
    const ret = await bcrypt.compare(pwd, this.password)
    return ret
  }

  user.beforeSave(async (user, options) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(user.password, salt)
      user.password = hash
    }
  })

  return user
};
