---
layout: default
title: Hacking
permalink: /dev
nav_order: 5
has_children: true
---

### Development Stack

**Gancio** is built with following technologies:

- [Nuxt.js](https://nuxtjs.org/)
- [Vue.js](https://vuejs.org/)
- Express
- Node.js
- [Sequelize](https://sequelize.org/)
- [Vuetify](https://vuetifyjs.com/)

### Testing on your own machine

1. Download source
```bash
git clone https://framagit.org/les/gancio
```

2. Install dependencies
```bash
yarn
```

3. Use a default sqlite configuration
```bash
cp config.example.json config.json
```

4. Run db migrations
```bash
./node_modules/.bin/sequelize db:migrate
```

5. Create a first admin user  
```bash
./server/cli.js users create admin secretpassword admin
```

6. Hacking
```bash
yarn dev
```

> info "Info"
> You can skip step n.5 and register the user from the UI, the first registered user will be an active administrator.

Please use the [issues](https://framagit.org/les/gancio/-/issues) to discuss any modification.
