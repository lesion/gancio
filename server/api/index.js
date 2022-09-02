const express = require('express')
const multer = require('multer')
const cors = require('cors')()

const config = require('../config')
const log = require('../log')

const api = express.Router()
api.use(express.urlencoded({ extended: false }))
api.use(express.json())


if (config.status !== 'READY') {

  const setupController = require('./controller/setup')
  const settingsController = require('./controller/settings')
  api.post('/settings', settingsController.setRequest)
  api.post('/setup/db', setupController.setupDb)
  api.post('/setup/restart', setupController.restart)
  api.post('/settings/smtp', settingsController.testSMTP)

} else {

  const { isAuth, isAdmin } = require('./auth')
  const eventController = require('./controller/event')
  const placeController = require('./controller/place')
  const tagController = require('./controller/tag')
  const settingsController = require('./controller/settings')
  const exportController = require('./controller/export')
  const userController = require('./controller/user')
  const instanceController = require('./controller/instance')
  const apUserController = require('./controller/ap_user')
  const resourceController = require('./controller/resource')
  const oauthController = require('./controller/oauth')
  const announceController = require('./controller/announce')
  const collectionController = require('./controller/collection')
  const helpers = require('../helpers')
  const storage = require('./storage')
  const upload = multer({ storage })

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
  api.get('/ping', (_req, res) => res.sendStatus(200))
  api.get('/user', isAuth, (_req, res) => res.json(res.locals.user))


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
  api.delete('/user', isAuth, userController.remove)

  // get all users
  api.get('/users', isAdmin, userController.getAll)

  /**
   * Get events
   * @category Event
   * @name /api/events
   * @type GET
   * @param {integer} [start] - start timestamp (default: now)
   * @param {integer} [end] - end timestamp (optional)
   * @param {array} [tags] - List of tags
   * @param {array} [places] - List of places id
   * @param {integer} [max] - Limit events
   * @param {boolean} [show_recurrent] - Show also recurrent events (default: as choosen in admin settings)
   * @param {integer} [page] - Pagination
   * @param {boolean} [older] - select <= start instead of >=
   * @example ***Example***
   * [https://demo.gancio.org/api/events](https://demo.gancio.org/api/events)
   * [usage example](https://framagit.org/les/gancio/-/blob/master/webcomponents/src/GancioEvents.svelte#L18-42)
   */

   api.get('/events', cors, eventController.select)

  /**
   * Add a new event
   * @category Event
   * @name /api/event
   * @type POST
   * @info `Content-Type` has to be `multipart/form-data` to support image upload
   * @param {string} title - event's title
   * @param {string} description - event's description (html accepted and sanitized)
   * @param {string} place_name - the name of the place
   * @param {string} [place_address] - the address of the place
   * @param {array} [place_details] - the details of the place
   * @param {integer} start_datetime - start timestamp
   * @param {integer} multidate - is a multidate event?
   * @param {array} tags - List of tags
   * @param {object} [recurrent] - Recurrent event details
   * @param {string} [recurrent.frequency] - could be `1w` or `2w`
   * @param {array} [recurrent.days] - array of days
   * @param {image} [image] - Image
   */

  // allow anyone to add an event (anon event has to be confirmed, TODO: flood protection)
  api.post('/event', eventController.isAnonEventAllowed, upload.single('image'), eventController.add)

  api.get('/event/search', eventController.search)

  api.put('/event', isAuth, upload.single('image'), eventController.update)
  api.get('/event/import', isAuth, helpers.importURL)

  // remove event
  api.delete('/event/:id', isAuth, eventController.remove)

  // get tags/places
  api.get('/event/meta', eventController.searchMeta)

  // add event notification TODO
  api.post('/event/notification', eventController.addNotification)
  api.delete('/event/notification/:code', eventController.delNotification)

  api.post('/settings', isAdmin, settingsController.setRequest)
  api.get('/settings', isAdmin, settingsController.getAll)
  api.post('/settings/logo', isAdmin, multer({ dest: config.upload_path }).single('logo'), settingsController.setLogo)
  api.post('/settings/smtp', isAdmin, settingsController.testSMTP)
  api.get('/settings/smtp', isAdmin, settingsController.getSMTPSettings)

  // get unconfirmed events
  api.get('/event/unconfirmed', isAdmin, eventController.getUnconfirmed)

  // [un]confirm event
  api.put('/event/confirm/:event_id', isAuth, eventController.confirm)
  api.put('/event/unconfirm/:event_id', isAuth, eventController.unconfirm)

  // get event
  api.get('/event/:event_slug.:format?', cors, eventController.get)

  // export events (rss/ics)
  api.get('/export/:type', cors, exportController.export)


  api.get('/place/all', isAdmin, placeController.getAll)
  api.get('/place/:placeName', cors, placeController.getEvents)
  api.get('/place', cors, placeController.search)
  // api.get('/placeNominatim/:place_details', cors, placeController._nominatim)
  api.put('/place', isAdmin, placeController.updatePlace)

  api.get('/tag', cors, tagController.search)
  api.get('/tag/:tag', cors, tagController.getEvents)

  // - FEDIVERSE INSTANCES, MODERATION, RESOURCES
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

  // - COLLECTIONS
  api.get('/collections/:name', cors, collectionController.getEvents)
  api.get('/collections', collectionController.getAll)
  api.post('/collections', isAdmin, collectionController.add)
  api.delete('/collection/:id', isAdmin, collectionController.remove)
  api.get('/filter/:collection_id', isAdmin, collectionController.getFilters)
  api.post('/filter', isAdmin, collectionController.addFilter)
  api.delete('/filter/:id', isAdmin, collectionController.removeFilter)

  // OAUTH
  api.get('/clients', isAuth, oauthController.getClients)
  api.get('/client/:client_id', isAuth, oauthController.getClient)
  api.post('/client', oauthController.createClient)
}

api.use((_req, res) => res.sendStatus(404))

// Handle 500
api.use((error, _req, res, _next) => {
  log.error('[API ERROR]', error)
  res.status(500).send('500: Internal Server Error')
})

module.exports = api
