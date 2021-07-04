---
layout: default
title: Nginx setup
permalink: /install/nginx
parent: Install
---



##  Nginx proxy configuration
This is the default nginx configuration for gancio, please modify at least <<YOUR_DOMAIN>>. Note that it does not include **HTTPS** setup but you can easily use [certbot](https://certbot.eff.org/) for that.


```nginx
server {
  listen 80;
  listen [::]:80;
  server_name <<YOUR_DOMAIN>>;

  keepalive_timeout    70;
  sendfile             on;
  client_max_body_size 80m;

  location / {
    try_files $uri @proxy;
  }

  location @proxy {
    proxy_set_header Host $host;
    proxy_pass http://127.0.0.1:13120;
  }
}

```
