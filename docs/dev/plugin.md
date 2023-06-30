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


## Example
Here is a complete example of plugins feature: [https://framagit.org/les/gancio/-/blob/master/plugins/gancioPluginExample.js](https://framagit.org/les/gancio/-/blob/master/plugins/gancioPluginExample.js) .

## Basic plugin syntax

A plugin is essentially an `index.js` file inside its own path in `./plugins`, e.g. `./plugins/my-example-plugin/index.js`
```javascript
module.exports = {
  
}
```

Plugins should be inside `./plugins` directory but you can specify another location using [`plugins_path`](https://gancio.org/install/config#plugins-path) configuration.

## Plugin details
A plugins **MUST** expose a `configuration` key where to specify its details:

```js
module.exports = {
  configuration: {
    name: 'Example',
    author: 'lesion',
    url: 'https://framagit.org/les/gancio/plugins/gancioPluginExample.js',
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
  }
}
```

[![/assets/plugins/settings.png](/assets/plugins/settings.png)](/assets/plugins/settings.png){: data-fancybox="group" data-caption="Home"}


## Load a plugin
When a plugin is enabled by an administrator, Gancio will call the `load` method if specified:

```js
load ({ settings: gancio_settings, db, helpers, log}, settings) {

  // access to your plugin local settings
  console.info('Your local settings are in ', settings)
  console.info(`For example, you can access to your default language setting by using ${settings.my_default_language}`)

  // access to gancio settings
  console.info(`Gancio settings are in ${gancio_settings}, e.g. ${gancio.settings.baseurl}`)

  // log something
  log.warn('This is a log entry from my example plugin')

  // use the DB (since 1.6.14)
  console.info(db.models.findAll())
  console.info(db.query('CREATE TABLE IF NOT EXISTS myPluginTable'))
}
```

## Expose an API <span class='label label-yellow'>since 1.6.4</span>

Plugins could have public HTTP endpoints by exposing an express Router in routeAPI object.

```js
const express = require('express')
const routeAPI = express.Router()

routeAPI.get('/test', (req, res) => {
  res.json('WOW!')
})
```

This endpoint will be exposed at <your_instance>/api/plugin/<your_plugin_name>/test
  

## Access to DB <span class='label label-yellow'>since 1.6.4</span>
TODO

## Helpers <span class='label label-red'>DOCUMENTATION NEEDED</span>
- randomString
- sanitizeHTML
- queryParamToBool

## React to events

```js
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
```


