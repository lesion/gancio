---
layout: default
title: Migration
permalink: /dev/migration
parent: Hacking
---

### Migration
If you need to modify the db's structure while hacking, it's super easy,
just change `server/api/models/`.  

If you then decide that your changes are good for production, a
sequelize migration is needed:

#### Create a migration:
`./node_modules/.bin/sequelize migration:generate --name your_migration`


