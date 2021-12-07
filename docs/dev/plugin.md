---
layout: default
title: Plugins
permalink: /dev/plugins
nav_order: 2
parent: Hacking
---

## Plugins
Since **v.1.2.2** you can write your own plugin that react to event related action (create,update,delete).

> info "What this is useful for?"
> - Do you want to create a post in your wordpress website each time an event is published? [hint](http://wp-api.org/node-wpapi/using-the-client/#creating-posts)
> - Do you want to send a summary notification of daily events via mail?
> - Notify a telegram group or share via twitter?  
>  
> [**<u>Please share your plugins or your needs</u>**](/contacts)

Plugins should be inside `./plugins` directory, this is an example:

```js
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
```


