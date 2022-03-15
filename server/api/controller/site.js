const { Op } = require('sequelize')
const config = require('../../config')
const mail = require('../mail')
const User = require('../models/user')
const Site = require('../models/site')
const settingsController = require('./settings')
const log = require('../../log')
const linkify = require('linkifyjs')
const crypto = require('crypto')

const siteController = {

  async getAll (req, res) {
    const sites = await Site.findAll()
    res.json(sites)
  },

//   async register (req, res) {
//     if (!settingsController.settings.allow_registration) { return res.sendStatus(404) }
//     const n_users = await User.count()
//     try {
//       req.body.recover_code = crypto.randomBytes(16).toString('hex')

//       // the first registered user will be an active admin
//       if (n_users === 0) {
//         req.body.is_active = req.body.is_admin = true
//         const user = await User.create(req.body)
//         return res.json(user)
//       }

//       req.body.is_active = false

//       // check email
//       if (!linkify.test(req.body.email, 'email')) {
//         return res.status(404).json('Invalid email')
//       }

//       log.info('Register user ', req.body.email)
//       const user = await User.create(req.body)
//       log.info(`Sending registration email to ${user.email}`)
//       mail.send(user.email, 'register', { user, config }, req.settings.locale)
//       mail.send(settingsController.settings.admin_email, 'admin_register', { user, config })
//       res.sendStatus(200)
//     } catch (e) {
//       log.error('Registration error:', e)
//       res.status(404).json(e)
//     }
//   },

  async create (req, res) {
    try {
      const site = await Site.create(req.body)
      const userBody = { is_active: true, email: req.body.email, siteId: site.id, is_active: true, is_admin: true }
      userBody.recover_code = crypto.randomBytes(16).toString('hex')
      const user = await User.scope('withRecover').create(userBody)
      mail.send(user.email, 'user_confirm', { user, config: { ...config, baseurl: res.locals.settings.baseurl } }, res.locals.settings.locale)
      res.json(site)
    } catch (e) {
      log.error('User creation error:', e)
      res.status(404).json(e)
    }
  },

//   async remove (req, res) {
//     try {
//       const user = await User.findByPk(req.params.id)
//       await user.destroy()
//       log.warn(`User ${user.email} removed!`)
//       res.sendStatus(200)
//     } catch (e) {
//       log.error('User removal error:"', e)
//       res.status(404).json(e)
//     }
//   }
}

module.exports = siteController
