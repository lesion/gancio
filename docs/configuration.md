---
layout: default
title: Configuration
permalink: /config
nav_order: 3
---

# Configuration
{: .no_toc }
Main `gancio` configuration is done with a configuration file.
This shoud be a `.json` or a `.js` file and could be specified using the `--config` flag.

- <small>eg. `gancio start --config ./config.json`</small>
- <small>eg. `pm2 start gancio start -- --config ~/config.json`</small>

1. TOC
{:toc}

- ### Title
The title will be in rss feed, in html head and in emails:

`"title": "Gancio"`

![title](assets/title.png)

- ### Description
`"description": "a shared agenda for local communities"`

- ### BaseURL
URL where your site will be accessible (include http or https):  
`"baseurl": "https://gancio.cisti.org"`

- ### Server
This probably support unix socket too :D

```json
"server": {
    "host": "localhost",
    "port": 13120
}
```

- ### Database
```json
  "db": {
    "dialect": "sqlite",
    "storage": "/tmp/db.sqlite"
  }
```
- ### Upload path
Where to save images
`"upload_path": "./uploads"`

- ### SMTP
- ### Admin
- ### Favicon
You could specify another favicon
`"favicon": "./favicon.ico"`

- ### Secret


## Default settings
```json
{
  "title": "Gancio",
  "description": "A shared agenda for local communities",
  "baseurl": "http://localhost:13120",
  "server": {
    "host": "0.0.0.0",
    "port": 13120
  },
  "db": {
    "dialect": "sqlite",
    "storage": "/tmp/db.sqlite"
  },
  "upload_path": "./",
  "favicon": "../dist/favicon.ico",
  "smtp": {
    "auth": {
      "user": "",
      "pass": ""
    },
    "secure": true,
    "host": ""
  },
  "admin": "",
  "secret": "notsosecret"
}
```