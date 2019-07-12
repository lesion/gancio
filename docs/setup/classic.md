---
layout: default
title: Classic
permalink: /seutp/classic
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

3. Setup
```bash
gancio setup
```

4. Start
```bash
gancio start
```
5. Enjoy :tada:  
Point your web browser to [http://localhost:3000](http://localhost:3000)



