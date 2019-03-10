const express = require('express')
const { fillUser, isAuth, isAdmin } = require('./auth')
const eventController = require('./controller/event')
const exportController = require('./controller/export')
const userController = require('./controller/user')
// const botController = require('./controller/bot')
const multer = require('multer')

const storage = require('./storage')({
  destination: 'uploads/'
})
const upload = multer({ storage })
const api = express.Router()

// login
api.post('/login', userController.login)

api.route('/user')
  // register
  .post(userController.register)
  // get current user
  .get(isAuth, userController.current)
  // update user (eg. confirm)
  .put(isAuth, isAdmin, userController.update)

// get all users
api.get('/users', isAuth, isAdmin, userController.getAll)

// update a tag (modify color)
api.put('/tag', isAuth, isAdmin, eventController.updateTag)

// update a place (modify address..)
api.put('/place', isAuth, isAdmin, eventController.updatePlace)

api.route('/user/event')
  // add event
  .post(fillUser, upload.single('image'), userController.addEvent)
  // update event
  .put(isAuth, upload.single('image'), userController.updateEvent)

// remove event
api.delete('/user/event/:id', isAuth, userController.delEvent)

// get tags/places
api.get('/event/meta', eventController.getMeta)

// get unconfirmed events
api.get('/event/unconfirmed', isAuth, isAdmin, eventController.getUnconfirmed)

// add event notification
api.post('/event/notification', eventController.addNotification)
api.delete('/event/del_notification/:code', eventController.delNotification)

// get event
api.get('/event/:event_id', eventController.get)

// confirm event
api.get('/event/confirm/:event_id', isAuth, isAdmin, eventController.confirm)

// export events (rss/ics)
api.get('/export/:type', exportController.export)

// get events in this range
api.get('/event/:year/:month', eventController.getAll)

// mastodon oauth auth
api.post('/user/getauthurl', isAuth, userController.getAuthURL)
api.post('/user/code', isAuth, userController.code)

module.exports = api
