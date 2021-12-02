
const plugin = {
  gancio: null,
  load (gancio) {
    console.error('Plugin GancioPluginExample loaded!')
    plugin.gancio = gancio
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
