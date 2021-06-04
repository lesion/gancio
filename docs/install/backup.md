---
layout: default
title: Backup
permalink: /backup
nav_order: 5
parent: Install
---

## Backup

The following commands should be valid for every setup (docker/debian/sqlite/postgres) but check your installation directory first.
This includes database, configuration, custom user locales, images and thumbnails for every release.

```bash
cd /opt/gancio/ # or /home/gancio or where your installation is
tar  -czf gancio-$(date +%Y-%m-%d-%H%M%S)-backup.tgz  \
  $(ls -d config.json uploads user_locale db.sqlite postgres data logs 2> /dev/null)
```
> warning "Permission denied"
> `postgres` directory could be with different permission or owner so you'll probably to be root or use `sudo` instead.

> info "Automatic backup"
> To periodically backup your data you should probably use something like [restic](https://restic.net) or [borg](https://www.borgbackup.org/)