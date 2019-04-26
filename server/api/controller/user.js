const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Mastodon = require('mastodon-api')
const { Op } = require('sequelize')
const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/user')
const config = require('../config')
const mail = require('../mail')
const { Event, Tag, Place } = require('../models/event')
const settingsController = require('./settings')
const eventController = require('./event')

const userController = {
  async login(req, res) {
    // find the user
    const user = await User.findOne({ where: { email: { [Op.eq]: req.body && req.body.email } } })
    if (!user) {
      res.status(404).json({ success: false, message: 'AUTH_FAIL' })
    } else if (user) {
      if (!user.is_active) {
        res.status(403).json({ success: false, message: 'NOT_CONFIRMED' })
      // check if password matches
      } else if (!await user.comparePassword(req.body.password)) {
        res.status(403).json({ success: false, message: 'AUTH_FAIL' })
      } else {
        // if user is found and password is right
        // create a token
        const accessToken = jsonwebtoken.sign({ user:
          {
            id: user.id,
            email: user.email,
            scope: [user.is_admin ? 'admin' : 'user']
          }},
          config.secret
        )
      
        res.json({token: accessToken})        
      }
    }
  },

  async logout(req, res) {

  },

  async setToken(req, res) {
    req.user.mastodon_auth = req.body
    await req.user.save()
    res.json(req.user)
  },

  async delEvent(req, res) {
    const event = await Event.findByPk(req.params.id)
    // check if event is mine (or user is admin)
    if (event && (req.user.is_admin || req.user.id === event.userId)) {
      if (event.image_path) {
        const old_path = path.resolve(__dirname, '..', '..', 'uploads', event.image_path)
        const old_thumb_path = path.resolve(__dirname, '..', '..', 'uploads', 'thumb', event.image_path)
        await fs.unlink(old_path)
        await fs.unlink(old_thumb_path)
      }
      await event.destroy()
      res.sendStatus(200)
    } else {
      res.sendStatus(403)
    }
  },

  // ADD EVENT
  async addEvent(req, res) {
    const body = req.body

    // remove description tag and create anchor tags
    const description = body.description
      .replace(/(<([^>]+)>)/ig, '')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')

    const eventDetails = {
      title: body.title,
      description,
      multidate: body.multidate,
      start_datetime: body.start_datetime,
      end_datetime: body.end_datetime,
      is_visible: !!req.user
    }

    if (req.file) {
      eventDetails.image_path = req.file.filename
    }

    let event = await Event.create(eventDetails)

    // create place
    let place
    try {
      place = await Place.findOrCreate({ where: { name: body.place_name },
        defaults: { address: body.place_address } })
        .spread((place, created) => place)
      await event.setPlace(place)
    } catch (e) {
      console.error(e)
    }

    // create/assign tags
    if (body.tags) {
      await Tag.bulkCreate(body.tags.map(t => ({ tag: t })), { ignoreDuplicates: true })
      const tags = await Tag.findAll({ where: { tag: { [Op.in]: body.tags } } })
      await event.addTags(tags)
    }
    if (req.user) await req.user.addEvent(event)
    event = await Event.findByPk(event.id, { include: [User, Tag, Place] })

    // insert notifications
    const notifications = await eventController.getNotifications(event)
    await event.setNotifications(notifications)

    return res.json(event)
  },

  async updateEvent(req, res) {
    const body = req.body
    const event = await Event.findByPk(body.id)
    if (!req.user.is_admin && event.userId !== req.user.id) {
      return res.sendStatus(403)
    }

    if (req.file) {
      if (event.image_path) {
        const old_path = path.resolve(__dirname, '..', '..', 'uploads', event.image_path)
        const old_thumb_path = path.resolve(__dirname, '..', '..', 'uploads', 'thumb', event.image_path)
        await fs.unlink(old_path, e => console.error(e))
        await fs.unlink(old_thumb_path, e => console.error(e))
      }
      body.image_path = req.file.filename
    }

    body.description = body.description
      .replace(/(<([^>]+)>)/ig, '') // remove all tags from description
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>') // add links

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
    const newEvent = await Event.findByPk(event.id, { include: [User, Tag, Place] })
    return res.json(newEvent)
  },

  async getAuthURL(req, res) {
    const instance = req.body.instance
    const is_admin = req.body.admin && req.user.is_admin
    const callback = `${config.baseurl}/${is_admin ? 'admin/oauth' : 'settings'}`
    const { client_id, client_secret } = await Mastodon.createOAuthApp(`https://${instance}/api/v1/apps`,
      config.title, 'read write', callback)
    const url = await Mastodon.getAuthorizationUrl(client_id, client_secret,
      `https://${instance}`, 'read write', callback)

    if (is_admin) {
      await settingsController.setAdminSetting('mastodon_auth', { client_id, client_secret, instance })
    } else {
      req.user.mastodon_auth = { client_id, client_secret, instance }
      await req.user.save()
    }
    res.json(url)
  },

  async code(req, res) {
    const { code, is_admin } = req.body
    let client_id, client_secret, instance
    const callback = `${config.baseurl}/${is_admin ? 'admin/oauth' : 'settings'}`

    if (is_admin) {
      const settings = await settingsController.settings();
      ({ client_id, client_secret, instance } = settings.mastodon_auth)
    } else {
      ({ client_id, client_secret, instance } = req.user.mastodon_auth)
    }

    try {
      const token = await Mastodon.getAccessToken(client_id, client_secret, code,
        `https://${instance}`, callback)
      const mastodon_auth = { client_id, client_secret, access_token: token, instance }
      if (is_admin) {
        await settingsController.setAdminSetting('mastodon_auth', mastodon_auth)
        res.json(instance)
      } else {
        req.user.mastodon_auth = mastodon_auth
        await req.user.save()
        // await bot.add(req.user, token)
        res.json(req.user)
      }
    } catch (e) {
      res.json(e)
    }
  },

  async forgotPassword(req, res) {
    const email = req.body.email
    const user = await User.findOne({ where: { email: { [Op.eq]: email } } })
    if (!user) return res.sendStatus(200)

    user.recover_code = crypto.randomBytes(16).toString('hex')
    mail.send(user.email, 'recover', { user, config })
    await user.save()
    res.sendStatus(200)
  },

  async checkRecoverCode(req, res) {
    const recover_code = req.body.recover_code
    if (!recover_code) return res.sendStatus(400)
    const user = await User.findOne({ where: { recover_code: { [Op.eq]: recover_code } } })
    if (!user) return res.sendStatus(400)
    res.json(user)
  },

  async updatePasswordWithRecoverCode(req, res) {
    const recover_code = req.body.recover_code
    if (!recover_code) return res.sendStatus(400)
    const password = req.body.password
    const user = await User.findOne({ where: { recover_code: { [Op.eq]: recover_code } } })
    if (!user) return res.sendStatus(400)
    user.password = password
    await user.save()
    res.sendStatus(200)
  },

  async current(req, res) {
    res.json(req.user)
  },

  async getAll(req, res) {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    })
    res.json(users)
  },

  async update(req, res) {
    const user = await User.findByPk(req.body.id)
    if (user) {
      if (!user.is_active && req.body.is_active) {
        await mail.send(user.email, 'confirm', { user, config })
      }
      await user.update(req.body)
      res.json(user)
    } else {
      res.sendStatus(400)
    }
  },

  async register(req, res) {
    console.error('register !!', req)
    const n_users = await User.count()
    try {
      if (n_users === 0) {
        // the first registered user will be an active admin
        req.body.is_active = req.body.is_admin = true
      } else {
        req.body.is_active = false
      }
      const user = await User.create(req.body)
      try {
        mail.send([user.email, config.admin], 'register', { user, config })
      } catch (e) {
        return res.status(400).json(e)
      }
      const payload = { email: user.email }
      const token = jwt.sign(payload, config.secret)
      res.json({ user, token })
    } catch (e) {
      res.status(404).json(e)
    }
  }
}

module.exports = userController
