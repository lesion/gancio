const express = require('express')
const multer = require('multer')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const expressJwt = require('express-jwt')
const config = require('config')

const { fillUser, isAuth, isAdmin } = require('./auth')
const eventController = require('./controller/event')
const exportController = require('./controller/export')
const userController = require('./controller/user')
const settingsController = require('./controller/settings')

const storage = require('./storage')
const upload = multer({ storage })

const api = express()
api.use(cookieParser())
api.use(bodyParser.urlencoded({ extended: false }))
api.use(bodyParser.json())

const jwt = expressJwt({
  secret: config.secret,
  credentialsRequired: false,
  getToken: function fromHeaderOrQuerystring (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies['auth._token.local']) {
      const [ prefix, token ] = req.cookies['auth._token.local'].split(' ')
      if (prefix === 'Bearer') return token
    }
  }
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

api.get('/settings', settingsController.getAllRequest)
api.post('/settings', jwt, fillUser, isAdmin, settingsController.setRequest)

api.get('/settings/user_locale', settingsController.getUserLocale)

// confirm event
api.get('/event/confirm/:event_id', jwt, isAuth, isAdmin, eventController.confirm)
api.get('/event/unconfirm/:event_id', jwt, isAuth, isAdmin, eventController.unconfirm)

// get event
api.get('/event/:event_id', jwt, fillUser, eventController.get)

// export events (rss/ics)
api.get('/export/:type', exportController.export)

// get events in this range
api.get('/event/:month/:year', eventController.getAll)

// Handle 404
api.use(function(req, res) {
  res.status(404).send('404: Page not Found')
})

// Handle 500
api.use(function(error, req, res, next) {
  res.status(500).send('500: Internal Server Error')
})


module.exports = api
