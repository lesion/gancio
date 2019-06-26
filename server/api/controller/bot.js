const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { event: Event, comment: Comment } = require('../models')
const config = require('config')
const Mastodon = require('mastodon-api')
const settingsController = require('./settings')
const get = require('lodash/get')

const botController = {
  bot: null,
  async initialize() {
    const access_token = get(settingsController.secretSettings, 'mastodon_auth.access_token')
    const instance = get(settingsController.settings, 'mastodon_instance')
    if (!access_token || !instance) return
    botController.bot = new Mastodon({
      access_token,
      api_url: `https://${instance}/api/v1`
    })
    const listener = botController.bot.stream('/streaming/public')
    listener.on('message', botController.message)
    listener.on('error', botController.error)
  //   const botUsers = await User.findAll({ where: { mastodon_auth: { [Op.ne]: null } } })
  //   console.log(botUsers)
  //   botController.bots = botUsers.map(user => {
  //     console.log('initialize bot ', user.name)
  //     console.log('.. ', user.mastodon_auth)
  //     const { client_id, client_secret, access_token } = user.mastodon_auth
  //     const bot = new Mastodon({ access_token, api_url: `https://${user.mastodon_instance}/api/v1/` })
  //     const listener = bot.stream('streaming/direct')
  //     listener.on('message', botController.message)
  //     return { email: user.email, bot }
  //   })
  // console.log(botController.bots)
  // },
  // add (user, token) {
  //   const bot = new Mastodon({ access_token: user.mastodon_auth.access_token, api_url: `https://${user.mastodon_instance}/api/v1/` })
  //   const listener = bot.stream('streaming/direct')
  //   listener.on('message', botController.message)
  //   listener.on('error', botController.error)
  //   botController.bots.push({ email: user.email, bot })
  },
  async post(instance, access_token, event) {
    const status = `${event.title} @${event.place.name} ${moment(event.start_datetime).format('ddd, D MMMM HH:mm')} - 
${event.description.length > 200 ? event.description.substr(0, 200) + '...' : event.description} - ${event.tags.map(t => '#' + t.tag).join(' ')} ${config.baseurl}/event/${event.id}`

    let media
    if (event.image_path) {
      const file = path.join(config.upload_path, event.image_path)
      if (fs.statSync(file)) {
        media = await bot.post('media', { file: fs.createReadStream(file) })
      }
    }
    return botController.bot.post('/statuses', { status, media_ids: media ? [media.data.id] : [] })
  },

  // TOFIX: enable message deletion
  async message(msg) {
    const type = msg.event
    const replyid = msg.data.in_reply_to_id
    if (!replyid) return
    let event = await Event.findOne({ where: { activitypub_id: replyid } })
    if (!event) {
      // check for comment..
      const comment = await Comment.findOne( { include: [Event], where: { activitypub_id: replyid }})
      if (!comment) return
      event = comment.event
    }
    await Comment.create({
      activitypub_id: msg.data.id,
      data: msg.data,
      eventId: event.id
    })
  },
  error(err) {
    console.log('error ', err)
  }
}
// botController.initialize()
setTimeout(botController.initialize, 5000)
module.exports = botController
