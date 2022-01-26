---
layout: default
title: Backup
permalink: /install/backup
nav_order: 5
parent: Install
---

## Backup

The following commands should be valid for every setup (docker/debian/sqlite/postgres).

1. Move to gancio path
```bash
cd /opt/gancio/ # or where your installation is
```

1. Backup PostgreSQL (only required for non-docker PostgreSQL installation)
```bash
sudo -u postgres pg_dump -Fc gancio > gancio.dump
```

1. Archive database, configuration, custom user locales, logs, images and thumbnails
```bash
sudo tar -czf gancio-$(date +%Y-%m-%d-%H%M%S)-backup.tgz  \
  $(ls -d config.json uploads user_locale db.sqlite gancio.dump postgres data db logs 2> /dev/null)
```

> info "Automatic backup"
> To periodically backup your data you should probably use something like [restic](https://restic.net) or [borg](https://www.borgbackup.org/)


## Restore

1. Install a clean gancio
1. Move to gancio path
```bash
cd /opt/gancio/ # or where your installation is
```

1. Extract your backup
```bash
tar xvf gancio-*-backup.tgz
```

1. Restore PostgreSQL database (only required for non-docker PostgreSQL installation)
```
sudo -u postgres createdb gancio
sudo -u postgres pg_restore -d gancio gancio.dump
```