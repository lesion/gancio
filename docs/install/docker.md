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

## Initial setup

> info "Clone not needed"
> You do not need to clone the full repo, a `Dockerfile` and a `docker-compose.yml` are enough.

- __Create a directory where everything related to gancio is stored__
```bash
mkdir -p /opt/gancio/data
cd /opt/gancio
```

## Use sqlite
<div class='code-example bg-grey-lt-100' markdown="1">
1. **Download docker-compose.yml and Dockerfile**
```bash
wget {{site.url}}{% link /docker/Dockerfile %}
wget {{site.url}}{% link /docker/sqlite/docker-compose.yml %}
```


1. Build docker image and launch interactive setup
```
docker-compose build
docker-compose run --rm gancio gancio setup --docker --db=sqlite
```
</div>

## Use postgreSQL
<div class='code-example bg-grey-lt-100' markdown="1">

1. **Download docker-compose.yml and Dockerfile**
```bash
wget {{site.url}}{% link /docker/Dockerfile %}
wget {{site.url}}{% link /docker/postgres/docker-compose.yml %}
```

1. Build docker image and launch interactive setup
```
docker-compose build
docker-compose run --rm gancio gancio setup --docker --db=postgres
```
</div>


## Start gancio

1. Run your container
```bash
docker-compose up -d
```

1. Look at logs
```bash
tail -f  data/logs/gancio.log
```

1. [Setup nginx as a proxy](/install/nginx)

1. Point your web browser to [http://localhost:13120](http://localhost:13120) or where you specified during setup and enjoy :tada:

1. Edit `data/config.json` and restart the container on your needs, see [Configuration]({% link install/configuration.md %}) for more details.

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
> 1. Download new `docker-compose.yml`  (substitute `sqlite` to `postgres` in case):  <br/>`wget {{site.url}}{% link /docker/sqlite/docker-compose.yml %}`
> 1. Build the new container `docker-compose build`
> 1. Extract your backup into `./data` <br/>`mkdir data; tar xvzf gancio-<yourLastBackup>-backup.tgz -C data`
> 1. Stop your old container `docker-compose stop`
> 1. Start your new container `docker-compose up`


```bash
cd /opt/gancio
docker-compose up -d --no-deps --build
```