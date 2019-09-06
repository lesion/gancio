'use strict'
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const util = require('util')

const generateKeyPair = util.promisify(crypto.generateKeyPair)

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: { msg: 'error.nick_taken' },
      index: true,
      allowNull: false
    },
    display_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique:  { msg: 'error.email_taken' },
      index: true,
      allowNull: false
    },
    description: DataTypes.TEXT,
    password: DataTypes.STRING,
    recover_code: DataTypes.STRING,
    is_admin: DataTypes.BOOLEAN,
    is_active: DataTypes.BOOLEAN,
    rsa: DataTypes.JSON,
    followers: {
      type: DataTypes.JSON,
      defaultValue: []
    }
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

  user.beforeCreate(async (user, options) => {
    // generate rsa keys
    const rsa = await generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    })
    user.rsa = rsa
  })

  return user
};
