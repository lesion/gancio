---
layout: default
title: Settings
permalink: /settings
nav_order: 3
---

# Settings
{: .no_toc }

1. TOC
{:toc}

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