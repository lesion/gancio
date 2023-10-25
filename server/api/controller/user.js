const crypto = require('crypto')
const { Op } = require('sequelize')
const config = require('../../config')
const mail = require('../mail')
const { User } = require('../models/models')
const settingsController = require('./settings')
const log = require('../../log')
const linkify = require('linkifyjs')

const userController = {

  async forgotPassword (req, res) {
    const email = req.body.email
    const user = await User.findOne({ where: { email: { [Op.eq]: email } } })
    if (!user) { return res.sendStatus(200) }

    user.recover_code = crypto.randomBytes(16).toString('hex')
    mail.send(user.email, 'recover', { user, config }, res.locals.locale)

    await user.save()
    res.sendStatus(200)
  },

  async checkRecoverCode (req, res) {
    const recover_code = req.body.recover_code
    if (!recover_code) { return res.sendStatus(400) }
    const user = await User.findOne({ where: { recover_code: { [Op.eq]: recover_code } } })
    if (!user) { return res.sendStatus(400) }
    res.json({ email: user.email })
  },

  async updatePasswordWithRecoverCode (req, res) {
    const recover_code = req.body.recover_code
    const password = req.body.password
    if (!recover_code || !password) { return res.sendStatus(400) }
    const user = await User.findOne({ where: { recover_code: { [Op.eq]: recover_code } } })
    if (!user) { return res.sendStatus(400) }
    try {
      await user.update({ recover_code: '', password })
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(400)
    }
  },

  async current (req, res) {
    if (!req.user) { return res.status(400).send('Not logged') }
    const user = await User.scope('withoutPassword').findByPk(req.user.id)
    res.json(user)
  },

  async getAll (req, res) {
    const users = await User.scope(req.user.is_admin ? 'withRecover' : 'withoutPassword').findAll({
      order: [['is_admin', 'DESC'], ['createdAt', 'DESC']]
    })
    res.json(users)
  },

  async update (req, res) {
    // user to modify
    const user = await User.findByPk(req.body.id)

    if (!user) { return res.status(404).json({ success: false, message: 'User not found!' }) }

    if (!req.body.password) { delete req.body.password }

    if ((!user.is_active && req.body.is_active) || user.recover_code) {
      mail.send(user.email, 'confirm', { user, config }, res.locals.settings.locale)
    }

    await user.update(req.body)
    res.status(200).send()
  },

  async register (req, res) {
    if (!settingsController.settings.allow_registration) { return res.sendStatus(404) }
    const n_users = await User.count()
    try {

      // the first registered user will be an active admin
      if (n_users === 0) {
        req.body.is_active = req.body.is_admin = true
        const user = await User.create(req.body)
        return res.json(user)
      }

      req.body.is_active = false
      req.body.is_admin = false

      // check email
      if (!linkify.test(req.body.email, 'email')) {
        return res.status(404).json('Invalid email')
      }

      log.info('Register user ', req.body.email)
      const user = await User.create(req.body)
      log.info(`Sending registration email to ${user.email}`)
      mail.send(user.email, 'register', { user, config }, res.locals.locale)
      mail.send(settingsController.settings.admin_email, 'admin_register', { user, config })
      res.sendStatus(200)
    } catch (e) {
      log.error('Registration error:', e)
      res.status(400).json(e)
    }
  },

  async create (req, res) {
    try {
      req.body.is_active = true
      req.body.recover_code = crypto.randomBytes(16).toString('hex')
      const user = await User.scope('withRecover').create(req.body)
      mail.send(user.email, 'user_confirm', { user, config }, res.locals.locale)
      res.json(user)
    } catch (e) {
      log.error('User creation error:', e)
      res.status(404).json(e)
    }
  },

  async remove (req, res) {
    try {
      let user
      if (req.user.is_admin && req.params.id) {
        user = await User.findByPk(req.params.id)
      } else {
        user = await User.findByPk(req.user.id)  
      }
      await user.destroy()
      log.warn(`User ${user.email} removed!`)
      res.sendStatus(200)
    } catch (e) {
      log.error('User removal error:"', e)
      res.status(404).json(e)
    }
  }
}

module.exports = userController
