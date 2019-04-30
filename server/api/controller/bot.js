const { User, Event, Comment, Tag } = require('../model')
const config = require('../../../config')
const Mastodon = require('mastodon-api')
// const Sequelize = require('sequelize')
// const Op = Sequelize.Op
const settingsController = require('./settings')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
moment.locale('it')

const botController = {
  bot: null,
  async initialize () {
    const settings = await settingsController.settings()
    if (!settings.mastodon_auth) return
    const mastodon_auth = settings.mastodon_auth
    botController.bot = new Mastodon({ 
      access_token: mastodon_auth.access_token,
      api_url: `https://${mastodon_auth.instance}/api/v1`
    })
    const listener = botController.bot.stream('/streaming/direct')
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
  async post (mastodon_auth, event) {
    const { access_token, instance } = mastodon_auth
    const bot = new Mastodon({ access_token, api_url: `https://${instance}/api/v1/` })
    const status = `${event.title} @ ${event.place.name} ${moment(event.start_datetime).format('ddd, D MMMM HH:mm')} - 
${event.description.length > 200 ? event.description.substr(0, 200) + '...' : event.description} - ${event.tags.map(t => '#' + t.tag).join(' ')} ${config.baseurl}/event/${event.id}`

    let media
    if (event.image_path) {
      const file = path.join(__dirname, '..', '..', '..', 'uploads', event.image_path)
      if (fs.statSync(file)) {
        media = await bot.post('media', { file: fs.createReadStream(file) })
      }
    }
    return bot.post('statuses', { status, visibility: 'direct', media_ids: media ? [media.data.id] : [] })
  },
  async message (msg) {
    console.log(msg)
    console.log(msg.data.accounts)
    const replyid = msg.data.in_reply_to_id || msg.data.last_status.in_reply_to_id
    if (!replyid) return
    const event = await Event.findOne({ where: { activitypub_id: replyid } })
    if (!event) {
      // check for comment..
      // const comment = await Comment.findOne( {where: { }})
      return 
    }
    const comment = await Comment.create({
      activitypub_id: msg.data.last_status.id, 
      text: msg.data.last_status.content,
      data: msg.data,
      author: msg.data.accounts[0].username 
    })
    event.addComment(comment)
    // const comment = await Comment.findOne( { where: {activitypub_id: msg.data.in_reply_to}} )
    // console.log('dentro message ', data)

  // add comment to specified event
  // let comment
  // if (!event) {
  // const comment = await Comment.findOne({where: {activitypub_id: req.body.id}, include: Event})
  // event = comment.event
  // }
  // const comment = new Comment(req.body)
  // event.addComment(comment)
  },
  error (err) {
    console.log('error ', err)
  }
}

setTimeout(botController.initialize, 2000)
module.exports = botController
