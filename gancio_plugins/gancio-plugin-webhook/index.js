const plugin = {
  configuration: {
    name: 'Webhook',
    author: 'lesion',
    url: 'https://framagit.org/les/gancio',
    description: 'Send an HTTP POST / webhook to specified endpoint with event creation/update/deletion',
    settings: {
      token: {
        type: 'TEXT',
        description: 'Auth token',
        required: true,
        hint: 'Your webhook <strong>token</strong>'
      },
      endpoint: {
        type: 'TEXT',
        description: 'HTTP endpoint to send webhook to',
        required: true,
        hint: 'The <strong>HTTP URL</strong> where to send the webhook.'
      },
    }
  },
  gancio: null, // { helpers, log, settings }
  log: null,
  bot: null,
  settings: null,

  load(gancio, settings) {
    plugin.gancio = gancio // contains all gancio settings, including all plugins settings
    plugin.log = gancio.log // just the logger
    plugin.settings = settings // this plugin settings

    plugin.log.info("Webhook plugin loaded!")
  },

  onTest() {
      plugin.log.debug(`[WEBHOOK Plugin] Sending test event`)
      return plugin._send({
        id: 255, title: "Test Event",
        slug: "test-6", description:"<p>This is the event description</p>",
        multidate: false, start_datetime: 1719356700,
        end_datetime: null,
        media:[{"url":"2bd078842958ffac3815cb994b20e9ff.jpg", height:795, width:800, name:"Test Event", size:139385, focalpoint:[0,0]}],
        is_visible:true, recurrent:null, online_locations:["https://autistici.org"],
        createdAt:"2024-06-26T09:30:52.638Z", updatedAt:"2024-06-26T09:48:50.249Z","placeId":326,
        tags: [{tag:"tag"}],
        place:{
          id:326, name:"Theaterplatz  63739 Aschaffenburg", address:"Oberstadt, Stadtmitte, Aschaffenburg, Bayern, 63739, Deutschland",
          latitude:57.1758333, longitude:26.8738889 }
        }, 'CREATE')
  },

  onEventCreate(event) {
    plugin.log.debug(`[WEBHOOK Plugin] Event "${event.title}" created`)
    plugin._send(event, 'CREATE')
  },

  onEventUpdate(event) {
    plugin.log.info(`[WEBHOOK Plugin] Event "${event.title}" updated`)
    plugin._send(event, 'UPDATE')
  },

  onEventDelete(event) {
    plugin.log.info(`[WEBHOOK Plugin] Event "${event.title}" deleted`)
    plugin._send(event, 'DELETE')
  },

  _send (event, action) {
    console.error(JSON.stringify({
      action,
      event
    }))
    
    return fetch(plugin.settings.endpoint, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${plugin.settings.token}`
      },
      body: JSON.stringify({
        action,
        event
      })
    }).then( response => {
      if (response?.ok) {
        plugin.log.info('[WEBHOOK Plugin] %s', response)
      } else {
        throw new Error(response?.status)
      }
    })
    .catch(e => {
      plugin.log.warn('[WEBHOOK Plugin] %s', e)
      throw e
    })
  }
}


module.exports = plugin
