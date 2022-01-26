---
layout: default
title: Docker
permalink: /install/docker
parent: Install
nav_order: 2
---
## Docker installation
{: .no_toc }

1. TOC
{:toc}

## Setup

Make sure to have [Docker Engine](https://docs.docker.com/engine/install/),
[Docker Compose](https://docs.docker.com/compose/install/) and [nginx](https://nginx.org/en/docs/install.html) installed:
```bash
sudo apt install docker docker-compose nginx
```

Create a directory where everything related to gancio is stored:
```bash
mkdir -p /opt/gancio
cd /opt/gancio
```

Download `Dockerfile` and `entrypoint.sh`:
```bash
wget {{site.url}}{% link /docker/Dockerfile %}
wget {{site.url}}{% link /docker/entrypoint.sh %}
```

Download `docker-compose.yml` choosing your preferred database dialect between `sqlite`, `postgres` and `mariadb`:
```bash
DB=sqlite
wget {{site.url}}/docker/$DB/docker-compose.yml
```

Build docker image
```bash
docker-compose build
```

## Start gancio

Start your container:
```bash
docker-compose up -d
```

You can take a look at logs using:
```bash
tail -f  data/logs/gancio.log
```

You'll need to [setup nginx as a proxy]({% link install/nginx.md %}) then you can point your web browser to your domain :tada:


## Upgrade

> warning "Backup your data"
> Backup your data is generally a good thing to do and this is especially true before upgrading.
> Don't be lazy and [backup]({% link install/backup.md %}) your data!


> error "Upgrade from a version < 1.0"
> Since v1.0 our docker setup is changed and a new container has to be built:
>
> 1. `cd /opt/gancio`
> 1. [Backup your data]({% link install/backup.md %})
> 1. Download new `Dockerfile` <br/> `wget {{site.url}}{% link /docker/Dockerfile %}`
> 1. Download new `entrypoint.sh` <br/> `wget {{site.url}}{% link /docker/entrypoint.sh %}`
> 1. Download new `docker-compose.yml`  (substitute `sqlite` with `postgres` in case):  <br/>`wget {{site.url}}{% link /docker/sqlite/docker-compose.yml %}`
> 1. Build the new container `docker-compose build`
> 1. Extract your backup into `./data` <br/>`mkdir data; tar xvzf gancio-<yourLastBackup>-backup.tgz -C data`
> 1. Stop your old container `docker-compose stop`
> 1. Start your new container `docker-compose up`


```bash
cd /opt/gancio
docker-compose up -d --no-deps --build
```
