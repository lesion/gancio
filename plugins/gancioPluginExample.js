const express = require('express')
const myPluginRouter = express.Router()

// this will answer at http://localhost:13120/api/plugin/Example/test
myPluginRouter.get('/test', (req, res) => {
  return res.json('OK!')
})

const plugin = {
  routeAPI: myPluginRouter,
  configuration: {
    name: 'Example',
    author: 'lesion',
    url: 'https://framagit.org/les/gancio',
    description: 'Example plugin',
    settings: {
      my_plugin_string_setting: {
        type: 'TEXT',
        description: 'My plugin string setting',
        required: true,
        hint: 'My plugin setting support <strong>html too</strong>'
      },
      enable_this_feature_in_my_plugin: {
        type: 'CHECK',
        description: 'My plugin best feature',
        required: true,
        hint: 'This feature is super dupe, enable it!'
      },
      min_post: {
        type: 'NUMBER',
        description: 'it supports number too'
      },
      my_default_language: {
        description: 'My default language',
        type: 'LIST',
        items: ['it', 'en', 'fr']
      }
    }    
  },
  gancio: null,
  settings: null,
  load (gancio, settings) {
    console.error('Plugin GancioPluginExample loaded!')
    console.error('Your settings are in ', settings)
    console.error(`For example, you can access to your default language setting by using ${settings.my_default_language}`)
    plugin.gancio = gancio
    plugin.settings = settings

    // gancio.db.models.event.findAll({ where: })
    // gancio.db.query('CREATE TABLE IF NOT EXISTS ()... ')

  },

  unload () {
    console.error('Unload this plugin!')
  },

  onTest () {
    console.error('called on "TEST" button pressed in admin interface')
  },

  onEventCreate (event) {
    const eventLink = `${plugin.gancio.settings.baseurl}/event/${event.slug}`
    if (!event.is_visible) {
      console.error(`Unconfirmed event created: ${event.title} / ${eventLink}`)
    } else {
      console.error(`Event created: ${event.title} / ${eventLink}`)
    }
  },

  onEventUpdate (event) {
    console.error(`Event "${event.title}" updated`)
  },

  onEventDelete (event) {
    console.error(`Event "${event.title}" deleted`)
  }
}


module.exports = plugin
