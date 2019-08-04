---
layout: default
title: Docker
permalink: /install/docker
parent: Install
---

## Install with docker

**You do not need to clone the full repo as we distribute gancio via npm.**  
[Dockerfile](https://git.lattuga.net/cisti/gancio/raw/docker/docker/Dockerfile) and [docker-compose.yml](https://git.lattuga.net/cisti/gancio/raw/docker/docker/docker-compose.yml) are the only needed files.

1. Create a directory where everything related to gancio is stored (db, images, config)
```bash
mkdir /opt/gancio
cd /opt/gancio
```
:information_source: you can choose a different directory of course

1. Download docker-compose.yml and Dockerfile
```bash
wget https://git.lattuga.net/cisti/gancio/raw/master/docker/Dockerfile
wget https://git.lattuga.net/cisti/gancio/raw/master/docker/docker-compose.yml
```

1. Create an empty configuration file (db.sqlite only needed for sqlite
   setup)
```
touch config.json db.sqlite
```
<small>After first setup, you can edit `config.json` file and restart the container on your needs.</small>

1. Build docker image and launch interactive setup in one step
```
docker-compose run --rm gancio gancio setup --docker
```

1. Run your container
```bash
docker-compose up -d
```

1. [Setup nginx as a proxy](/setup/nginx)

1. Point your web browser to [http://localhost:13120](http://localhost:13120) or where you specified during setup and enjoy :tada:
