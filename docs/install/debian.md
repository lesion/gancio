---
title: Debian
permalink: /install/debian
nav_order: 1
parent: Install
---

## Debian installation

1. Install dependencies
```bash
sudo apt install curl gcc g++ make wget libpq-dev
```


1. Install Node.js & yarn
```bash
curl -sL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs
sudo npm install -g yarn
```
<small>[source](https://github.com/nodesource/distributions/blob/master/README.md)</small>

#### Choose you database (sqlite, postgresql, mariadb, mysql)
1. Setup using postgreSQL __(optional)__
```bash
sudo apt-get install postgresql
# Create the database
su postgres -c psql
postgres=# create database gancio;
postgres=# create user gancio with encrypted password 'gancio';
postgres=# grant all privileges on database gancio to gancio;
```

1. Setup using MariaDB (__optional__)
```bash
sudo apt-get install mariadb
sudo mysql
MariaDB [(none)]> create database gancio;
Query OK, 1 row affected (0.001 sec)
MariaDB [(none)]> create user gancio identified by 'gancio';
Query OK, 0 rows affected (0.011 sec)
MariaDB [(none)]> grant all privileges on gancio.* to gancio;
Query OK, 0 rows affected (0.009 sec)
```

1. Create a user to run gancio from
```bash
sudo adduser --group --system --shell /bin/false --home /opt/gancio gancio
```
1. Install Gancio
```bash
sudo yarn global add --network-timeout 1000000000 --silent {{site.url}}/latest.tgz
```

> info "Install another release"
> You can found old releases at [{{site.url}}/releases]({{site.url}}/releases)

> info "Package verification"
> Distributed packages are signed with [this key](/assets/underscore_to.hacklab.asc) you can verify the signature using:  
> `gpg --verify latest.tgz.sig`


1. Setup systemd service and reload systemd
```bash
sudo wget http://gancio.org/gancio.service -O /etc/systemd/system/gancio.service
sudo systemctl daemon-reload
sudo systemctl enable gancio
```

1. Start gancio service (this should listen on port 13120)
```bash
sudo systemctl start gancio
```

1. [Setup nginx as a proxy]({% link install/nginx.md %})

1. Point your web browser to your domain :tada:

## Upgrade

> warning "Backup your data"
> Backup your data is generally a good thing to do and this is especially true before upgrading.
> Don't be lazy and [backup]({% link install/backup.md %}) your data!

```bash
sudo yarn global remove gancio
sudo yarn cache clean
sudo yarn global add --network-timeout 1000000000 --silent {{site.url}}/latest.tgz
sudo systemctl restart gancio
```
