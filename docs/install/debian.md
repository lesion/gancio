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
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -
sudo apt-get install -y nodejs
sudo npm install -g yarn
```
<small>[source](https://github.com/nodesource/distributions/blob/master/README.md)</small>


1. Setup with postgreSQL __(optional as you can choose sqlite)__
```bash
sudo apt-get install postgresql
# Create the database
su postgres -c psql
postgres=# create database gancio;
postgres=# create user gancio with encrypted password 'gancio';
postgres=# grant all privileges on database gancio to gancio;
```

1. Create a user to run gancio from
```bash
sudo adduser --group --system --shell /bin/false --home /opt/gancio gancio
```
1. Install Gancio
```bash
sudo yarn global add --silent {{site.url}}/latest.tgz 2> /dev/null
```

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
yarn global remove gancio
yarn cache clean
yarn global add --silent {{site.url}}/latest.tgz  2> /dev/null
sudo systemctl restart gancio
```
