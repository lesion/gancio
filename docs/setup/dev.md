---
layout: default
title: Classic
permalink: /setup/classic
parent: Setup
---

## Classic setup

1. Install Node.js and postgreSQL
```bash
curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs postgresql
```
<small>[source](https://github.com/nodesource/distributions/blob/master/README.md)</small>
1. Install Gancio
```bash
npm install --global gancio
```

1. Create a database (optional as you can use sqlite, but recommended)
```bash
sudo -u postgres psql
postgres=# create database gancio;
postgres=# create user gancio with encrypted password 'gancio';
postgres=# grant all privileges on database gancio to gancio;
```

1. Create a user to run gancio from
```bash
adduser gancio
su gancio
```

1. Test & launch interactive setup
```bash
gancio --help
gancio setup
```

1. Start
```bash
gancio start
```
1. Point your web browser to [http://localhost:13120](http://localhost:13120) or where you selected during setup.

1. [Setup nginx as a proxy](/setup/nginx)

1. Deploy in production  
If you don't use the [docker way](/setup/docker), in production you should use something like **[pm2](http://pm2.keymetrics.io/)**:

```bash
sudo npm install --global pm2
pm2 gancio start
```
