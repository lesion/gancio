const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const jsonwebtoken = require('jsonwebtoken')
const config = require('config')
const mail = require('../mail')
const { user: User, event: Event, tag: Tag, place: Place, fed_users: FedUsers } = require('../models')
const settingsController = require('./settings')
const federation = require('../../federation/helpers')

const userController = {
  async login (req, res) {
    // find the user
    const user = await User.findOne({ where: {
      [Op.or]: [
        { email: req.body.email },
        { username: req.body.email }
      ]
    } })
    if (!user) {
      res.status(403).json({ success: false, message: 'auth.fail' })
    } else if (user) {
      if (!user.is_active) {
        res.status(403).json({ success: false, message: 'auth.not_confirmed' })
      // check if password matches
      } else if (!await user.comparePassword(req.body.password)) {
        res.status(403).json({ success: false, message: 'auth.fail' })
      } else {
        // if user is found and password is right
        // create a token
        const accessToken = jsonwebtoken.sign(
          {
            id: user.id,
            email: user.email,
            scope: [user.is_admin ? 'admin' : 'user']
          },
          config.secret
        )
        res.json({ token: accessToken })
      }
    }
  },

  async delEvent (req, res) {
    const event = await Event.findByPk(req.params.id)
    // check if event is mine (or user is admin)
    if (event && (req.user.is_admin || req.user.id === event.userId)) {
      if (event.image_path) {
        const old_path = path.join(config.upload_path, event.image_path)
        const old_thumb_path = path.join(config.upload_path, 'thumb', event.image_path)
        try {
          console.error('media files not removed')
          // TOFIX
          // await fs.unlink(old_path)
          // await fs.unlink(old_thumb_path)
        } catch (e) {
          console.error(e)
        }
      }
      await event.destroy()
      res.sendStatus(200)
    } else {
      res.sendStatus(403)
    }
  },

  // ADD EVENT
  async addEvent (req, res) {
    const body = req.body

    const eventDetails = {
      title: body.title,
      // remove html tag
      description: body.description ? body.description.replace(/(<([^>]+)>)/ig, '') : '',
      multidate: body.multidate,
      start_datetime: body.start_datetime,
      end_datetime: body.end_datetime,

      recurrent: body.recurrent,
      // publish this event only if authenticated
      is_visible: !!req.user
    }

    if (req.file) {
      eventDetails.image_path = req.file.filename
    }

    const event = await Event.create(eventDetails)

    // create place if needed
    let place
    try {
      place = await Place.findOrCreate({ where: { name: body.place_name },
        defaults: { address: body.place_address } })
        .spread((place, created) => place)
      await event.setPlace(place)
      event.place = place
    } catch (e) {
      console.error(e)
    }
    // create/assign tags
    if (body.tags) {
      await Tag.bulkCreate(body.tags.map(t => ({ tag: t })), { ignoreDuplicates: true })
      const tags = await Tag.findAll({ where: { tag: { [Op.in]: body.tags } } })
      await Promise.all(tags.map(t => t.update({ weigth: Number(t.weigth) + 1 })))
      await event.addTags(tags)
      event.tags = tags
    }

    if (req.user) {
      await req.user.addEvent(event)
      await event.setUser(req.user)
    }

    // send response to client
    res.json(event)

    const user = await User.findByPk(req.user.id, { include: { model: FedUsers, as: 'followers' }})
    if (user) { federation.sendEvent(event, user) }

    // res.sendStatus(200)

    // send notification (mastodon/email/confirmation)
    // notifier.notifyEvent(event.id)
  },

  async updateEvent (req, res) {
    const body = req.body
    const event = await Event.findByPk(body.id)
    if (!req.user.is_admin && event.userId !== req.user.id) {
      return res.sendStatus(403)
    }

    if (req.file) {
      if (event.image_path) {
        const old_path = path.resolve(config.upload_path, event.image_path)
        const old_thumb_path = path.resolve(config.upload_path, 'thumb', event.image_path)
        await fs.unlink(old_path, e => console.error(e))
        await fs.unlink(old_thumb_path, e => console.error(e))
      }
      body.image_path = req.file.filename
    }

    body.description = body.description
      .replace(/(<([^>]+)>)/ig, '') // remove all tags from description

    await event.update(body)
    let place
    try {
      place = await Place.findOrCreate({ where: { name: body.place_name },
        defaults: { address: body.place_address } })
        .spread((place, created) => place)
    } catch (e) {
      console.log('error', e)
    }
    await event.setPlace(place)
    await event.setTags([])
    if (body.tags) {
      await Tag.bulkCreate(body.tags.map(t => ({ tag: t })), { ignoreDuplicates: true })
      const tags = await Tag.findAll({ where: { tag: { [Op.in]: body.tags } } })
      await event.addTags(tags)
    }
    const newEvent = await Event.findByPk(event.id, { include: [Tag, Place] })
    res.json(newEvent)
  },

  async forgotPassword (req, res) {
    const email = req.body.email
    const user = await User.findOne({ where: { email: { [Op.eq]: email } } })
    if (!user) { return res.sendStatus(200) }

    user.recover_code = crypto.randomBytes(16).toString('hex')
    mail.send(user.email, 'recover', { user, config })

    await user.save()
    res.sendStatus(200)
  },

  async checkRecoverCode (req, res) {
    const recover_code = req.body.recover_code
    if (!recover_code) { return res.sendStatus(400) }
    const user = await User.findOne({ where: { recover_code: { [Op.eq]: recover_code } } })
    if (!user) { return res.sendStatus(400) }
    try {
      await user.update({ recover_code: '' })
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(400)
    }
  },

  async updatePasswordWithRecoverCode (req, res) {
    const recover_code = req.body.recover_code
    const password = req.body.password
    if (!recover_code || !password) { return res.sendStatus(400) }
    const user = await User.findOne({ where: { recover_code: { [Op.eq]: recover_code } } })
    if (!user) { return res.sendStatus(400) }
    user.recover_code = ''
    user.password = password
    try {
      await user.save()
      res.sendStatus(200)
    } catch (e) {
      res.sendStatus(400)
    }
  },

  async current (req, res) {
    if (!req.user) return res.status(400).send('Not logged')
    const user = await User.findByPk(req.user.id, { include: { model: FedUsers, as: 'followers' } })
    res.json(user) 
  },

  async getAll (req, res) {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    })
    res.json(users)
  },

  async update (req, res) {
    // user to modify
    user = await User.findByPk(req.body.id)

    if (!user) { return res.status(404).json({ success: false, message: 'User not found!' }) }

    if (req.body.id !== req.user.id && !req.user.is_admin) {
      return res.status(400).json({ succes: false, message: 'Not allowed' })
    }

    // ensure username to not change if not empty
    req.body.username = user.username ? user.username : req.body.username

    if (!req.body.password) { delete req.body.password }

    await user.update(req.body)

    if (!user.is_active && req.body.is_active && user.recover_code) {
      mail.send(user.email, 'confirm', { user, config })
    }
    res.json(user)
  },

  async register (req, res) {
    if (!settingsController.settings.allow_registration) { return res.sendStatus(404) }
    const n_users = await User.count()
    try {
      // the first registered user will be an active admin
      if (n_users === 0) {
        req.body.is_active = req.body.is_admin = true
      } else {
        req.body.is_active = false
      }

      req.body.recover_code = crypto.randomBytes(16).toString('hex')
      const user = await User.create(req.body)
      try {
        mail.send(user.email, 'register', { user, config })
        mail.send(config.admin, 'admin_register', { user, config })
      } catch (e) {
        return res.status(400).json(e)
      }
      const payload = {
        id: user.id,
        email: user.email,
        scope: [user.is_admin ? 'admin' : 'user']
      }
      const token = jwt.sign(payload, config.secret)
      res.json({ token, user })
    } catch (e) {
      res.status(404).json(e)
    }
  },

  async create (req, res) {
    try {
      req.body.is_active = true
      req.body.recover_code = crypto.randomBytes(16).toString('hex')
      const user = await User.create(req.body)
      mail.send(user.email, 'user_confirm', { user, config })
      res.json(user)
    } catch (e) {
      res.status(404).json(e)
    }
  },

  async remove (req, res) {
    try {
      const user = await User.findByPk(req.params.id)
      user.destroy()
      res.sendStatus(200)
    } catch (e) {
      res.status(404).json(e)
    }
  }
}

module.exports = userController
