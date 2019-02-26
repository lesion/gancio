const jwt = require('jsonwebtoken')
const { User, Event, Comment, Tag } = require('../model')
const config = require('../config')
const mail = require('../mail')
const Mastodon = require('mastodon-api')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const moment = require('moment')
moment.locale('it')
const botController = {
  bots: [],
  async initialize () {
    console.log('initialize bots')
    const botUsers = await User.findAll({ where: { mastodon_auth: { [Op.ne]: null } } })
    console.log(botUsers)
    botController.bots = botUsers.map(user => {
      console.log('initialize bot ', user.name)
      console.log('.. ', user.mastodon_auth)
      const { client_id, client_secret, access_token } = user.mastodon_auth
      const bot = new Mastodon({ access_token, api_url: `https://${user.mastodon_instance}/api/v1/` })
      const listener = bot.stream('streaming/direct')
      listener.on('message', botController.message)
      listener.on('error', botController.error)
      return { email: user.email, bot }
    })
    console.log(botController.bots)
  },
  add (user) {
    const bot = new Mastodon({ access_token: user.mastodon_auth.access_token, api_url: `https://${user.mastodon_instance}/api/v1/` })
    const listener = bot.stream('streaming/direct')
    listener.on('message', botController.message)
    listener.on('error', botController.error)
    botController.bots.push({ email: user.email, bot })
  },
  post (user, event) {
    const { bot } = botController.bots.filter(b => b.email === user.email)[0]
    const status = `${event.title} @ ${event.place.name} ${moment(event.start_datetime).format('ddd, D MMMM HH:mm')} - 
${event.description} - ${event.tags.map(t => '#' + t.tag).join(' ')} ${config.baseurl}/event/${event.id}`
    return bot.post('/statuses', { status, visibility: 'private' })
  },
  async message (msg) {
    console.log(msg)
    console.log(msg.data.accounts)
    const replyid = msg.data.in_reply_to_id || msg.data.last_status.in_reply_to_id
    if (!replyid) return
    // const event = await Event.findOne({ where: { activitypub_id: replyid } })
    // if (!event) {
      // check for comment..
      // const comment = await Comment.findOne( {where: { }})
    // }
    // const comment = await Comment.create({activitypub_id: msg.data.last_status.id, text: msg.data.last_status.content, author: msg.data.accounts[0].username })
    // event.addComment(comment)
    // console.log(event)
    // const comment = await Comment.findOne( { where: {activitypub_id: msg.data.in_reply_to}} )
    // console.log('dentro message ', data)
    
    // add comment to specified event
    // let comment
    //if (!event) {
      //const comment = await Comment.findOne({where: {activitypub_id: req.body.id}, include: Event})
      //event = comment.event
    //}
    //const comment = new Comment(req.body)
    //event.addComment(comment)
  },
  error (err) {
    console.log('error ', err)
  }
}

setTimeout(botController.initialize, 2000)
module.exports = botController
