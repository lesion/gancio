const express = require('express')
const multer = require('multer')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const { isAuth, isAdmin } = require('./auth')
const eventController = require('./controller/event')
const exportController = require('./controller/export')
const userController = require('./controller/user')
const settingsController = require('./controller/settings')
const instanceController = require('./controller/instance')
const apUserController = require('./controller/ap_user')
const resourceController = require('./controller/resource')

const storage = require('./storage')
const upload = multer({ storage })

const debug = require('debug')('api')

const api = express.Router()
api.use(cookieParser())
api.use(bodyParser.urlencoded({ extended: false }))
api.use(bodyParser.json())

// AUTH
api.post('/auth/login', userController.login)
api.get('/auth/user', userController.current)

api.post('/user/recover', userController.forgotPassword)
api.post('/user/check_recover_code', userController.checkRecoverCode)
api.post('/user/recover_password', userController.updatePasswordWithRecoverCode)

// register and add users
api.post('/user/register', userController.register)
api.post('/user', isAdmin, userController.create)

// update user
api.put('/user', isAuth, userController.update)

// delete user
api.delete('/user/:id', isAdmin, userController.remove)

// api.delete('/user', userController.remove)

// get all users
api.get('/users', isAdmin, userController.getAll)

// update a place (modify address..)
api.put('/place', isAdmin, eventController.updatePlace)

// add event
api.post('/user/event', upload.single('image'), userController.addEvent)

// update event
api.put('/user/event', isAuth, upload.single('image'), userController.updateEvent)

// remove event
api.delete('/user/event/:id', isAuth, userController.delEvent)

// get tags/places
api.get('/event/meta', eventController.getMeta)

// get unconfirmed events
api.get('/event/unconfirmed', isAdmin, eventController.getUnconfirmed)

// add event notification
api.post('/event/notification', eventController.addNotification)
api.delete('/event/notification/:code', eventController.delNotification)

api.get('/settings', settingsController.getAllRequest)
api.post('/settings', isAdmin, settingsController.setRequest)

api.get('/settings/user_locale', settingsController.getUserLocale)

// confirm event
api.get('/event/confirm/:event_id', isAuth, eventController.confirm)
api.get('/event/unconfirm/:event_id', isAuth, eventController.unconfirm)

// get event
api.get('/event/:event_id.:format?', eventController.get)

// export events (rss/ics)
api.get('/export/:type', exportController.export)

// get events in this range
api.get('/event/:month/:year', eventController.getAll)

api.get('/instances', isAdmin, instanceController.getAll)
api.get('/instances/:instance_domain', isAdmin, instanceController.get)
api.post('/instances/toggle_block', isAdmin, instanceController.toggleBlock)
api.post('/instances/toggle_user_block', isAdmin, apUserController.toggleBlock)
api.put('/resources/:resource_id', isAdmin, resourceController.hide)
api.delete('/resources/:resource_id', isAdmin, resourceController.remove)
api.get('/resources', isAdmin, resourceController.getAll)

// Handle 404
api.use((req, res) => {
  debug('404 Page not found: %s', req.path)
  res.status(404).send('404: Page not Found')
})

// Handle 500
api.use((error, req, res, next) => {
  debug(error)
  res.status(500).send('500: Internal Server Error')
})

module.exports = api
