---
layout: default
title: Classic
permalink: /setup/classic
parent: Setup
---

## Classic setup

1. Install Node.js
```bash
curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt-get install -y nodejs
```
<small>[source](https://github.com/nodesource/distributions/blob/master/README.md)</small>
2. Install Gancio
```bash
npm install --global gancio
```
3. Create database (optional)
```sql
apt install postgresql
sudo -u postgres psql
postgres=# create database gancio;
postgres=# create user gancio with encrypted password 'gancio';
postgres=# grant all privileges on database gancio to gancio;
```

4. Create a new user
```bash
adduser gancio
su gancio
```

5. Setup & test
```bash
gancio --help
gancio setup
gancio start
```

6. Enjoy :tada:  
Point your web browser to [http://localhost:3000](http://localhost:3000)

