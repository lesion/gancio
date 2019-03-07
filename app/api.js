const express = require('express')
const { fillUser, isAuth, isAdmin } = require('./auth')
const eventController = require('./controller/event')
const exportController = require('./controller/export')
// const botController = require('./controller/bot')

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const api = express.Router()

// USER API
const userController = require('./controller/user')

api.post('/login', userController.login)

api.route('/user')
  .post(userController.register)
  .get(isAuth, userController.current)
  .put(isAuth, isAdmin, userController.update)

api.get('/users', isAuth, isAdmin, userController.getAll)
api.put('/tag', isAuth, isAdmin, eventController.updateTag)
api.put('/place', isAuth, isAdmin, eventController.updatePlace)

api.route('/user/event')
  .post(fillUser, upload.single('image'), userController.addEvent)
  .get(isAuth, userController.getMyEvents)
  .put(isAuth, upload.single('image'), userController.updateEvent)

api.delete('/user/event/:id', isAuth, userController.delEvent)

api.get('/event/meta', eventController.getMeta)
api.get('/event/unconfirmed', isAuth, isAdmin, eventController.getUnconfirmed)
api.post('/event/reminder', eventController.addReminder)

api.get('/event/:event_id', eventController.get)
api.get('/event/confirm/:event_id', isAuth, isAdmin, eventController.confirm)

api.get('/export/:type', exportController.export)

api.get('/event/:year/:month', eventController.getAll)

api.post('/user/getauthurl', isAuth, userController.getAuthURL)
api.post('/user/code', isAuth, userController.code)

module.exports = api
