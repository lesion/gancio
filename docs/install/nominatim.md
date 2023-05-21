---
layout: default
title: Nominatim
permalink: /install/nominatim
parent: Install
nav_order: 7
---

## Nominatim installation
{: .no_toc }

1. TOC
{:toc}

---

## Testing
For testing purposes you could skip the nominatim installation and use one of these geocoding providers that run a server for free:

- [https://photon.komoot.io/](https://photon.komoot.io/) [Terms of service](https://photon.komoot.io/)
- [https://nominatim.openstreetmap.org/](https://nominatim.openstreetmap.org/) [Terms of service](https://operations.osmfoundation.org/policies/nominatim/)

---

## Requirements
From [https://nominatim.org/release-docs/latest/admin/Installation/](https://nominatim.org/release-docs/latest/admin/Installation/)

"A minimum of 2GB of RAM is required or installation will fail. For a full planet import 128GB of RAM or more are strongly recommended. Do not report out of memory problems if you have less than 64GB RAM."

### Planet mirrors
There is a list of planet mirrors at [https://wiki.openstreetmap.org/wiki/Planet.osm#Planet.osm_mirrors](https://wiki.openstreetmap.org/wiki/Planet.osm#Planet.osm_mirrors)      
There you can also find `Country and area extracts`, divided by `Worldwide extract sources` and `Regional extract sources`

### Download an extract
For Nominatim to work, you need to import files in [PBF Format](https://wiki.openstreetmap.org/wiki/PBF_Format) in the PostGis database. Those files have extension `*.osm.pbf`.

Some of these mirrors provide also incremental updates via [OsmChange](https://wiki.openstreetmap.org/wiki/OsmChange), for example:
- These provide updates but with a lower detail    
[https://download.geofabrik.de/europe/italy/nord-ovest-updates/nord-ovest-latest.osm.pbf](http://download.geofabrik.de/europe/italy/nord-ovest-latest.osm.pbf)    
[https://download.geofabrik.de/europe/italy/nord-ovest-updates/](https://download.geofabrik.de/europe/italy/nord-ovest-updates/)
- This doesn't provide updates but has an higher level of detail     
[https://osmit-estratti-test.wmcloud.org/dati/poly/province/pbf/015_Milano_poly.osm.pbf](https://osmit-estratti-test.wmcloud.org/dati/poly/province/pbf/015_Milano_poly.osm.pbf)

Do you need to host multiple areas? Checkout [Osmium](https://osmcode.org/osmium-tool/manual.html), to merge multiple PBF files into one.

---

## Install on Debian
There is a [detailed documentation](https://nominatim.org/release-docs/latest/appendix/Install-on-Ubuntu-22/) for installing nominatim on `Ubuntu 22` that should be valid also to install on `Debian`.

### Setup
[https://nominatim.org/release-docs/latest/appendix/Install-on-Ubuntu-22/#installing-the-required-software](https://nominatim.org/release-docs/latest/appendix/Install-on-Ubuntu-22/#installing-the-required-software)

### Building and Configuration

Get the source code from Github and change into the source directory
```bash
cd $USERHOME
wget https://nominatim.org/release/Nominatim-4.2.0.tar.bz2
tar xf Nominatim-4.2.0.tar.bz2
```

The code must be built in a separate directory. Create this directory, then configure and build Nominatim in there:
```bash
mkdir $USERHOME/build
cd $USERHOME/build
cmake $USERHOME/Nominatim-4.2.0
make
```

### Setting up the webserver
[https://nominatim.org/release-docs/latest/appendix/Install-on-Ubuntu-22/#setting-up-a-webserver](https://nominatim.org/release-docs/latest/appendix/Install-on-Ubuntu-22/#setting-up-a-webserver)

### Import the database
[https://nominatim.org/release-docs/latest/admin/Import/](https://nominatim.org/release-docs/latest/admin/Import/)

---

## Install using docker

### Setup
Make sure to have [Docker Engine](https://docs.docker.com/engine/install/),
[Docker Compose](https://docs.docker.com/compose/install/) and [git](https://git-scm.com/downloads) installed:
```bash
sudo apt install docker docker-compose git
```

### Clone the project
From [https://github.com/mediagis/nominatim-docker](https://github.com/mediagis/nominatim-docker)    

- Clone the project from sources
```bash
git clone git@github.com:mediagis/nominatim-docker.git
cd nominatim-docker/4.2/contrib # released Nov 29, 2022
docker-compose pull
```

- Or, use the template at `docs/docker/nominatim`
```bash
cd /opt/gancio/docs/docker/nominatim
docker-compose pull
```

### Import the database
See [Requirements](#requirements) about downloading the `.osm.pbf` files
```bash
cd docs/docker/nominatim/
wget https://download.geofabrik.de/europe/italy/nord-ovest-latest.osm.pbf \
    ./nominatim/data/default.osm.pbf
```

### Configure the environment file
```bash
cd docs/docker/nominatim/
cp .env.example .env
```
Create a random password for nominatim and add it to .env file
```bash
NOMINATIM_PASSWORD=$(echo random_password | openssl passwd --stdin);
sed -i -e 's/\(NOMINATIM_PASSWORD=\)\(.*\)/\1'$NOMINATIM_PASSWORD'/g' .env
```

### Start nominatim-docker

Start your container:
```bash
docker-compose up -d
```
Checkout the logs to see when data are imported to the database:
```bash
docker-compose logs -f
```

Try out the search:

[http://0.0.0.0:8080/search?q=building](http://0.0.0.0:8080/search?q=building)
