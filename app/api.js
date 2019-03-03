const express = require('express')
const { isAuth, isAdmin } = require('./auth')

const eventController = require('./controller/event')
const exportController = require('./controller/export')
// const botController = require('./controller/bot')

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const api = express.Router()

// USER API
const userController = require('./controller/user')

api.route('/login')
  .post(userController.login)

api.route('/user')
  .post(userController.register)
  .get(isAuth, userController.current)
  .put(isAuth, isAdmin, userController.update)

api.get('/users', isAuth, isAdmin, userController.getAll)
api.put('/tag', isAuth, isAdmin, eventController.updateTag)
api.put('/place', isAuth, isAdmin, eventController.updatePlace)

api.route('/user/event')
  .post(isAuth, upload.single('image'), userController.addEvent)
  .get(isAuth, userController.getMyEvents)
  .put(isAuth, upload.single('image'), userController.updateEvent)

api.route('/user/event/:id')
  .delete(isAuth, userController.delEvent)

api.get('/event/meta', eventController.getMeta)
api.route('/event/:event_id')
  .get(eventController.get)

// api.get('/export/feed', exportController.feed)
// api.get('/export/ics', exportController.ics)
api.get('/export/:type', exportController.export)

api.route('/event/:year/:month')
  .get(eventController.getAll)

api.post('/user/getauthurl', isAuth, userController.getAuthURL)
api.post('/user/code', isAuth, userController.code)

module.exports = api
