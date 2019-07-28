const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { event: Event, comment: Comment } = require('../models')
const config = require('config')
const Mastodon = require('mastodon-api')
const settingsController = require('./settings')
const get = require('lodash/get')

const botController = {
  bots: null,
  async initialize() {
    const access_token = get(settingsController.secretSettings, 'mastodon_auth.access_token')
    const instance = get(settingsController.settings, 'mastodon_instance')
    if (!access_token || !instance) return
    botController.bot = new Mastodon({
      access_token,
      api_url: `https://${instance}/api/v1`
    })
    const listener = botController.bot.stream('/streaming/user')
    listener.on('message', botController.message)
    listener.on('error', botController.error)
  },
  async post(event) {
    const status = `${event.title} @${event.place.name} ${moment(event.start_datetime).format('ddd, D MMMM HH:mm')} - 
${event.description.length > 200 ? event.description.substr(0, 200) + '...' : event.description} - ${event.tags.map(t => '#' + t.tag).join(' ')} ${config.baseurl}/event/${event.id}`

    let media
    if (event.image_path) {
      const file = path.resolve(config.upload_path, event.image_path)
      if (fs.statSync(file)) {
        media = await botController.bot.post('/media', { file: fs.createReadStream(file) })
      }
    }
    return botController.bot.post('/statuses', { status, media_ids: media ? [media.data.id] : [] })
  },

  async message(msg) {
    const type = msg.event

    if (type === 'delete') {
      const activitypub_id = String(msg.data)
      const event = await Comment.findOne({ where: { activitypub_id } })
      if (event) await event.destroy()
      return
    }

    const activitypub_id = String(msg.data.status.in_reply_to_id)
    if (!activitypub_id) return
    let event = await Event.findOne({ where: { activitypub_id } })
    if (!event) {
      // check for comment..
      const comment = await Comment.findOne( { include: [Event], where: { activitypub_id }})
      if (!comment) return
      event = comment.event
    }
    await Comment.create({
      activitypub_id: String(msg.data.status.id),
      data: msg.data.status,
      eventId: event.id
    })
  },
  error(err) {
    console.log('error ', err)
  }
}

setTimeout(botController.initialize, 5000)
module.exports = botController
