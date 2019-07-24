---
layout: default
title: Settings
permalink: /settings
nav_order: 3
---

# Settings
Main `gancio` configuration is done with a configuration file.
This shoud be a `.json` or a `.js` file and could be specified using the `--config` flag.

- <small>eg. `gancio start --config ./config.json'</small>
- <small>eg. `pm2 start gancio start -- --config ~/config.json'</small>

Default configuration 
{: .no_toc }

1. TOC
{:toc}


#### Title
####


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
  "admin": {
    "email": "",
    "password": ""
  },
  "secret": "notsosecret"
}
```