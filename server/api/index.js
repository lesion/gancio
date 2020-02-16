const express = require('express')
const multer = require('multer')
const cors = require('cors')()

const { isAuth, isAdmin, hasPerm } = require('./auth')
const eventController = require('./controller/event')
const exportController = require('./controller/export')
const userController = require('./controller/user')
const settingsController = require('./controller/settings')
const instanceController = require('./controller/instance')
const apUserController = require('./controller/ap_user')
const resourceController = require('./controller/resource')
const oauthController = require('./controller/oauth')
const announceController = require('./controller/announce')

const storage = require('./storage')
const upload = multer({ storage })

const debug = require('debug')('api')

const api = express.Router()
api.use(express.urlencoded({ extended: false }))
api.use(express.json())

/**
 * Get current authenticated user
 * @category User
 * @name /api/user
 * @type GET
 * @example **Response**
 * ```json
{
   "description" : null,
   "recover_code" : "",
   "id" : 1,
   "createdAt" : "2020-01-29T18:10:16.630Z",
   "updatedAt" : "2020-01-30T22:42:14.789Z",
   "is_active" : true,
   "settings" : "{}",
   "email" : "eventi@cisti.org",
   "is_admin" : true
}
```
 */
api.get('/user', isAuth, (req, res) => res.json(req.user))

api.post('/user/recover', userController.forgotPassword)
api.post('/user/check_recover_code', userController.checkRecoverCode)
api.post('/user/recover_password', userController.updatePasswordWithRecoverCode)

// register and add users
api.post('/user/register', userController.register)
api.post('/user', isAdmin, userController.create)

// update user
api.put('/user', hasPerm('user:update'), userController.update)

// delete user
api.delete('/user/:id', isAdmin, userController.remove)
api.delete('/user', hasPerm('user:remove'), userController.remove)

// get all users
api.get('/users', isAdmin, userController.getAll)

// update a place (modify address..)
api.put('/place', isAdmin, eventController.updatePlace)

/**
 * Add a new event
 * @category Event
 * @name /event
 * @type POST
 * @info `Content-Type` has to be `multipart/form-data` 'cause support image upload
 * @param {string} title - event's title
 * @param {string} description - event's description (html accepted and sanitized)
 * @param {string} place_name - the name of the place
 * @param {string} [place_address] - the address of the place
 * @param {integer} start_datetime - start timestamp
 * @param {integer} multidate - is a multidate event?
 * @param {array} tags - List of tags
 * @param {object} [recurrent] - Recurrent event details
 * @param {string} [recurrent.frequency] - could be `1w` or `2w`
 * @param {string} [recurrent.type] - not used
 * @param {array} [recurrent.days] - array of days
 * @param {image} [image] - Image
 */
api.post('/event', upload.single('image'), eventController.add)

api.put('/event', hasPerm('event:write'), upload.single('image'), eventController.update)

// remove event
api.delete('/event/:id', hasPerm('event:remove'), eventController.remove)

// get tags/places
api.get('/event/meta', eventController.getMeta)

// get unconfirmed events
api.get('/event/unconfirmed', isAdmin, eventController.getUnconfirmed)

// add event notification TODO
api.post('/event/notification', eventController.addNotification)
api.delete('/event/notification/:code', eventController.delNotification)

api.get('/settings', settingsController.getAllRequest)
api.post('/settings', isAdmin, settingsController.setRequest)
api.post('/settings/favicon', isAdmin, multer({ dest: 'thumb/' }).single('favicon'), settingsController.setFavicon)

// confirm event
api.get('/event/confirm/:event_id', hasPerm('event:write'), eventController.confirm)
api.get('/event/unconfirm/:event_id', hasPerm('event:write'), eventController.unconfirm)

// get event
api.get('/event/:event_id.:format?', cors, eventController.get)

// export events (rss/ics)
api.get('/export/:type', cors, exportController.export)

// get events in this range
// api.get('/event/:month/:year', cors, eventController.getAll)
api.get('/event', cors, eventController.select)

api.get('/instances', isAdmin, instanceController.getAll)
api.get('/instances/:instance_domain', isAdmin, instanceController.get)
api.post('/instances/toggle_block', isAdmin, instanceController.toggleBlock)
api.post('/instances/toggle_user_block', isAdmin, apUserController.toggleBlock)
api.put('/resources/:resource_id', isAdmin, resourceController.hide)
api.delete('/resources/:resource_id', isAdmin, resourceController.remove)
api.get('/resources', isAdmin, resourceController.getAll)

// - ADMIN ANNOUNCEMENTS
api.get('/announcements', isAdmin, announceController.getAll)
api.post('/announcements', isAdmin, announceController.add)
api.put('/announcements/:announce_id', isAdmin, announceController.update)
api.delete('/announcements/:announce_id', isAdmin, announceController.remove)

api.get('/clients', hasPerm('oauth:read'), oauthController.getClients)
api.get('/client/:client_id', hasPerm('oauth:read'), oauthController.getClient)
api.post('/client', oauthController.createClient)

api.use((req, res) => res.sendStatus(404))

// Handle 500
api.use((error, req, res, next) => {
  debug(error)
  res.status(500).send('500: Internal Server Error')
})

module.exports = api
