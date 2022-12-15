---
layout: default
title: Plugins
permalink: /usage/plugins
nav_order: 2
parent: Usage
has_toc: true
---

# Plugins
{: .no_toc }

This page is a guide to install plugins, if you want to develop one instead look [here](/dev/plugins)

1. TOC
{:toc}



## Install

To install a plugin you have to:

1. **download the .zip archive (look for the url on the plugin list below)**
```
wget https://framagit.org/les/gancio-plugin-telegram-bridge/-/archive/v0.2.0/gancio-plugin-telegram-bridge-v0.2.0.zip
```

2. **unpack it in the `./plugins` directory.**
```
cd plugins
unzip https://framagit.org/les/gancio-plugin-telegram-bridge/-/archive/v0.2.0/gancio-plugin-telegram-bridge-v0.2.0.zip
```


3. **install the dependencies with `yarn`**
```
cd plugins/gancio-plugin-telegram-bridge
yarn
```

4. **restart gancio**  
__with debian__
```
sudo sytemctl restart gancio
```
__with docker__
```
docker-compose restart
```

# List of plugins

## __Telegram__

This plugin republishes events to Telegram channels or groups. 
The goal is to spread the info of our networks to the capitalist cyberspace, and pull otherwise isolated people to our radical and free part of the internet.

- **Website**: [https://framagit.org/bcn.convocala/gancio-plugin-telegram-bridge](https://framagit.org/bcn.convocala/gancio-plugin-telegram-bridge)
- **Download**: [gancio-plugin-telegram-bridge-v0.2.0.zip](https://framagit.org/les/gancio-plugin-telegram-bridge/-/archive/v0.2.0/gancio-plugin-telegram-bridge-v0.2.0.zip)
- **Release**: v0.2.0 / 10 Dec '22

