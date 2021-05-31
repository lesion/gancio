---
layout: default
title: Backup
permalink: /backup
nav_order: 5
---

## Backup

The following commands should be valid for every setup (docker/debian/sqlite/postgres) but check your installation directory first.
This includes database, configuration, custom user locales, media, images and thumbnails.

```bash
cd /opt/gancio/ # or /home/gancio
tar --ignore-failed-read -czf gancio-$(date +%Y-%m-%d-%H%M%S)-backup.tgz \
  config.json \
  uploads \
  user_locale \
  db.sqlite \
  postgres \
  data
```

> info "Automatic backup"
> To periodically backup your data you should probably use something like [restic](https://restic.net) or [borg](https://www.borgbackup.org/)