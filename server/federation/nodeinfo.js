const express = require('express')
const router = express.Router()
const cors = require('cors')
const settingsController = require('../api/controller/settings')
const config = require('config')
const version = require('../../package.json').version

router.use(cors())

router.get('/', (req, res) => {
  const ret = {
    version: '1.0',
    server: {
      baseUrl: config.baseurl,
      name: config.title,
      software: 'Gancio',
      version
    },
    protocols: ['activitypub'],
    openRegistrations: settingsController.settings.allow_registration,
    usage: {
      users: {
        total: 10
      }
    },
    localPost: 3,
    localComments: 0
  }
  res.json(ret)
})

module.exports = router
