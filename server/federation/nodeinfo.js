const express = require('express')
const router = express.Router()
const { user: User } = require('../api/models')
const settingsController = require('../api/controllers/settings')
const config = require('config')
const version = require('../../package.json').version

router.get('/', async (req, res) => {
  const ret = {
    version: '1.0',
    server: {
      baseUrl: config.baseurl,
      name: config.title,
      software: 'Gancio',
      version
    },
    protocols: ['activitypub'],
    openRegistrations: settingsControllers.settings.allow_registration,
    usage:{
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
