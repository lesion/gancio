---
layout: default
title: Docker
permalink: /install/docker
parent: Install
---

## Install with docker
**You do not need to clone the full repo as we distribute gancio via npm.**  
A [Dockerfile](https://framagit.org/les/gancio/raw/docker/docker/Dockerfile) and a docker-compose.yml are the only files needed.

1. Create a directory where everything related to gancio is stored (db, images, config)
```bash
mkdir /opt/gancio
cd /opt/gancio
```
:information_source: <small>you can choose a different directory.</small>

### Using postgreSQL
1. Download docker-compose.yml and Dockerfile
```bash
wget https://framagit.org/les/gancio/raw/master/docker/Dockerfile
wget https://framagit.org/les/gancio/raw/master/docker/docker-compose.postgresql.yml -O docker.compose.yml
```

1. Create an empty configiguration (**this is needed**)
```
touch config.json
```

### Using sqlite
1. Download docker-compose.yml and Dockerfile
```bash
wget https://framagit.org/les/gancio/raw/master/docker/Dockerfile
wget https://framagit.org/les/gancio/raw/master/docker/docker-compose.sqlite.yml -O docker-compose.yml
```

1. Create an empty db and config (**this is needed**)
```
touch config.json db.sqlite
```

### Finish

1. Build docker image and launch interactive setup in one step
```
docker-compose run --rm gancio gancio setup --docker
```

1. Run your container
```bash
docker-compose up -d
```

1. [Setup nginx as a proxy](/install/nginx)

1. Point your web browser to [http://localhost:13120](http://localhost:13120) or where you specified during setup and enjoy :tada:

1. You can edit `config.json` file and restart the container on your needs, see [Configuration](/config) for more details.
