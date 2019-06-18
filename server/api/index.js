const express = require('express')
const multer = require('multer')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const expressJwt = require('express-jwt')
const config = require('../config')

const { fillUser, isAuth, isAdmin } = require('./auth')
const eventController = require('./controller/event')
const exportController = require('./controller/export')
const userController = require('./controller/user')
const settingsController = require('./controller/settings')

const storage = require('./storage')

const upload = multer({ storage })
const api = express.Router()
api.use(cookieParser())
api.use(bodyParser.urlencoded({ extended: false }))
api.use(bodyParser.json())

const jwt = expressJwt({
  secret: config.secret,
  credentialsRequired: false
})

// AUTH
api.post('/auth/login', userController.login)
api.post('/auth/logout', userController.logout)
api.get('/auth/user', jwt, fillUser, userController.current)

api.post('/user/recover', userController.forgotPassword)
api.post('/user/check_recover_code', userController.checkRecoverCode)
api.post('/user/recover_password', userController.updatePasswordWithRecoverCode)

// register and add users
api.post('/user/register', userController.register)
api.post('/user', jwt, isAuth, isAdmin, userController.create)

// update user (disable/)
api.put('/user', jwt, isAuth, isAdmin, userController.update)

//delete user
api.delete('/user/:id', jwt, isAuth, isAdmin, userController.remove)

// 
// api.delete('/user', userController.remove)

// get all users
api.get('/users', jwt, isAuth, isAdmin, userController.getAll)

// update a tag (modify color)
api.put('/tag', jwt, isAuth, isAdmin, eventController.updateTag)

// update a place (modify address..)
api.put('/place', jwt, isAuth, isAdmin, eventController.updatePlace)

// add event
api.post('/user/event', jwt, fillUser, upload.single('image'), userController.addEvent)
  
// update event
api.put('/user/event', jwt, isAuth, upload.single('image'), userController.updateEvent)

// remove event
api.delete('/user/event/:id', jwt, isAuth, userController.delEvent)

// get tags/places
api.get('/event/meta', eventController.getMeta)

// get unconfirmed events
api.get('/event/unconfirmed', jwt, isAuth, isAdmin, eventController.getUnconfirmed)

// add event notification
api.post('/event/notification', eventController.addNotification)
api.delete('/event/notification/:code', eventController.delNotification)

api.get('/settings', jwt, fillUser, isAdmin, settingsController.getAdminSettings)
api.post('/settings', jwt, fillUser, isAdmin, settingsController.setAdminSetting)

// get event
api.get('/event/:event_id', eventController.get)

// confirm event
api.get('/event/confirm/:event_id', jwt, isAuth, isAdmin, eventController.confirm)
api.get('/event/unconfirm/:event_id', jwt, isAuth, isAdmin, eventController.unconfirm)

// export events (rss/ics)
api.get('/export/:type', exportController.export)

// get events in this range
api.get('/event/:month/:year', eventController.getAll)
// api.get('/event/:month/:year', eventController.getAfter)

// mastodon oauth auth
api.post('/settings/getauthurl', jwt, isAuth, isAdmin, settingsController.getAuthURL)
api.get('/settings/oauth', jwt, isAuth, isAdmin, settingsController.code)

module.exports = api
