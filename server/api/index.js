const express = require('express')
const multer = require('multer')
const { fillUser, isAuth, isAdmin } = require('./auth')
const eventController = require('./controller/event')
const exportController = require('./controller/export')
const userController = require('./controller/user')
const settingsController = require('./controller/settings')
const { SECRET_CONF } = require('../../config')
const cookieParser = require('cookie-parser')

const expressJwt = require('express-jwt')
const jwt = expressJwt({
  secret: SECRET_CONF.secret,
  credentialsRequired: false,
  getToken: req => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies['auth._token.local']) {
      const tmp = req.cookies['auth._token.local'].split(' ');
      return tmp[1]
    }
    return null 
  }
})

const storage = require('./storage')({
  destination: 'uploads/'
})

const upload = multer({ storage })
const api = express.Router()
api.use(cookieParser())
// AUTH
api.post('/auth/login', userController.login)
api.post('/auth/logout', userController.logout)
api.get('/auth/user', jwt, fillUser, userController.current)

api.post('/user/recover', userController.forgotPassword)
api.post('/user/check_recover_code', userController.checkRecoverCode)
api.post('/user/recover_password', userController.updatePasswordWithRecoverCode)

api
  .route('/user')
  // register
  .post(userController.register)
  // get current user
  // .get(isAuth, userController.current)
  // update user (eg. confirm)
  .put(jwt, isAuth, isAdmin, userController.update)

// get all users
api.get('/users', jwt, isAuth, isAdmin, userController.getAll)

// update a tag (modify color)
api.put('/tag', jwt, isAuth, isAdmin, eventController.updateTag)

// update a place (modify address..)
api.put('/place', jwt, isAuth, isAdmin, eventController.updatePlace)

api
  .route('/user/event')
  // add event
  .post(jwt, fillUser, upload.single('image'), userController.addEvent)
  // update event
  .put(jwt, isAuth, upload.single('image'), userController.updateEvent)

// remove event
api.delete('/user/event/:id', jwt, isAuth, userController.delEvent)

// get tags/places
api.get('/event/meta', eventController.getMeta)

// get unconfirmed events
api.get('/event/unconfirmed', jwt, isAuth, isAdmin, eventController.getUnconfirmed)

// add event notification
api.post('/event/notification', eventController.addNotification)
api.delete('/event/notification/:code', eventController.delNotification)

api.get('/settings', settingsController.getAdminSettings)
api.post('/settings', settingsController.setAdminSetting)

// get event
api.get('/event/:event_id', eventController.get)

// confirm event
api.get('/event/confirm/:event_id', jwt, isAuth, isAdmin, eventController.confirm)
api.get('/event/unconfirm/:event_id', jwt, isAuth, isAdmin, eventController.unconfirm)

// export events (rss/ics)
api.get('/export/:type', exportController.export)

// get events in this range
api.get('/event/:month/:year', eventController.getAll)

// mastodon oauth auth
api.post('/settings/getauthurl', jwt, isAuth, isAdmin, settingsController.getAuthURL)
api.get('/settings/oauth', jwt, isAuth, isAdmin, settingsController.code)

module.exports = api
