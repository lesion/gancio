---
layout: default
title: Nginx setup
permalink: /install/nginx
parent: Install
---



##  Nginx proxy configuration
This is the default nginx configuration for gancio, it does not include **HTTPS** setup but you can easily use [certbot](https://certbot.eff.org/) for that.


```nginx
server {
  listen 80;
  listen [::]:80;
  server_name <<YOUR_DOMAIN>>;

  keepalive_timeout    70;
  sendfile             on;
  client_max_body_size 80m;

  gzip on;
  gzip_disable "msie6";
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_buffers 16 8k;
  gzip_http_version 1.1;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

  add_header Strict-Transport-Security "max-age=31536000";

  location / {
    try_files $uri @proxy;
  }

  location @proxy {
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Proxy "";
    proxy_pass_header Server;

    proxy_pass http://127.0.0.1:13120;
    proxy_buffering on;
    proxy_redirect off;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;

    tcp_nodelay on;
  }
}

```
