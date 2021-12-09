---
title: Configuration
permalink: /install/config
nav_order: 6
parent: Install
---

## Configuration
{: .no_toc }
`gancio` configuration is done during installation process but you can change it editing the configuration file.
The configuration file shoud be a `.json` or a `.js` file and could be specified using the `--config` flag.

- <small>eg. `gancio start --config ./config.json`</small>
- <small>eg. `pm2 start gancio start -- --config ~/config.json`</small>

1. TOC
{:toc}

- ### Server
This probably support unix socket too

```json
"server": {
    "host": "localhost",
    "port": 13120
}
```

- ### Database
DB configuration, look [here](https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor) for options.
```json
  "db": {
    "dialect": "sqlite",
    "storage": "/tmp/db.sqlite"
  }
```
- ### Upload path
Where to save images
`"upload_path": "./uploads"`

- ### User locale
Probably you want to modify some text for your specific community, that's
why we thought the `user_locale` configuration: you can specify your version of
each string of **gancio** making a directory with your locales inside.
For example, let's say you want to modify the text shown during registration:  
`mkdir /opt/gancio/user_locale`  

put something like this in `/opt/gancio/user_locale/en.json` to override the registration description in
english:  
```json
{
  "registrer": {
    "description": "My new registration page description"
  }
}
```  
and then point the `user_locale` configuration to that directory (in your `config.json`):  
```json
"user_locale": "/opt/gancio/user_locale"
```  
Watch [here](https://framagit.org/les/gancio/tree/master/locales) for a
list of strings you can override.

> warning "Restart needed"
> Note that a restart is needed when you change user_locale's content.
