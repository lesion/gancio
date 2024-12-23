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

2. Download source
```bash
git clone https://framagit.org/les/gancio
```

3. Install dependencies
```bash
yarn
```

4. Use a default sqlite configuration
```bash
cp config.example.json config.json
```

5. Run db migrations
```bash
./node_modules/.bin/sequelize db:migrate
```

6. Create a first admin user
You can skip this step and register an user from the UI, the first registered user will be an active administrator.

```bash
./server/cli.js users create admin secret-password admin
```

7. Hacking
```bash
yarn dev
```

Please use the [issues](https://framagit.org/les/gancio/-/issues) to discuss any modification.
