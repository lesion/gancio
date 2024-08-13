---
layout: default
title: Install
permalink: /install
has_children: true
nav_order: 3
has_toc: false
---
## Pre-requisites
- a Linux machine with <strong>root access</strong> (a VPS with 500MB of RAM and a cpu should be enough but do not use docker on a small machine :stuck_out_tongue_winking_eye:)
- a domain name or subdomain (eg. gancio.mydomain.org, [subpath is not yet supported](https://framagit.org/les/gancio/-/issues/430))
- optionally an SMTP server to deliver emails

## Install

- [Install on Debian]({% link install/debian.md %})
- [Install using Docker]({% link install/docker.md %})
- [Install using YunoHost](https://apps.yunohost.org/app/gancio)

## Other methods

- [Install with fly.io](https://rennerocha.com/posts/configuring-self-hosted-calendar-for-small-community/)

### Post installation
- [Setup a backup]({% link install/backup.md %})


> info "Info"
> If you wanna hack or run the current development release take a look at [Hacking & contribute]({% link dev/dev.md %}).
>
