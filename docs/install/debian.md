---
title: Debian
permalink: /install/debian
nav_order: 1
parent: Install
---

## Debian installation

1. Install Node.js & yarn (**from root**)
```bash
curl -sL https://deb.nodesource.com/setup_16.x | bash -
apt-get install -y nodejs
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg |  apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list
apt-get update && apt-get install yarn
```
<small>[source](https://github.com/nodesource/distributions/blob/master/README.md)</small>

1. Install Gancio
```bash
yarn global add --silent {{site.url}}/latest.tgz 2> /dev/null
```

1. Setup with postgreSQL __(optional as you can choose sqlite)__
```bash
apt-get install postgresql
# Create the database
su postgres -c psql
postgres=# create database gancio;
postgres=# create user gancio with encrypted password 'gancio';
postgres=# grant all privileges on database gancio to gancio;
```

1. Create a user to run gancio from
```bash
adduser gancio
su gancio
```

1. Launch interactive setup
```bash
gancio setup --config config.json
```

1. Start
```bash
gancio start --config config.json
```
1. Point your web browser to [http://localhost:13120](http://localhost:13120) or where you selected during setup.

1. [Setup nginx as a proxy]({% link install/nginx.md %})

1. To deploy gancio in production you should use something like **[pm2](http://pm2.keymetrics.io/)**:

```bash
sudo yarn global add pm2
pm2 start gancio -- --config config.json

# Run this command to run your application as a service and automatically restart after a reboot:
pm2 startup # read the output!
sudo pm2 startup -u gancio
```

## Upgrade

> warning "Backup your data"
> Backup your data is generally a good thing to do and this is especially true before upgrading.
> Don't be lazy and [backup]({% link install/backup.md %}) your data!

```bash
sudo yarn global remove gancio
sudo yarn global add --silent {{site.url}}/latest.tgz  2> /dev/null
sudo service pm2 restart
```
