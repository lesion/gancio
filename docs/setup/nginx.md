---
layout: default
title: Nginx
permalink: /setup/nginx
parent: Setup
---

##  Nginx proxy configuration
This is the default nginx configuration for gancio, please modify at least the **server_name** and **ssl_certificate**'s path

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name gancio.cisti.org;
  root /var/www/letsencrypt;
  location /.well-known/acme-challenge/ { allow all; }
  location / { return 301 https://$host$request_uri; }
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name gancio.cisti.org;

  ssl_protocols TLSv1.2;
  ssl_ciphers HIGH:!MEDIUM:!LOW:!aNULL:!NULL:!SHA;
  ssl_prefer_server_ciphers on;
  ssl_session_cache shared:SSL:10m;

  # Uncomment these lines once you acquire a certificate:
  # ssl_certificate     /etc/letsencrypt/live/gancio.cisti.org/fullchain.pem;
  # ssl_certificate_key /etc/letsencrypt/live/gancio.cisti.org/privkey.pem;

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