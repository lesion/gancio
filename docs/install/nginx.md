---
layout: default
title: Nginx setup
permalink: /install/nginx
parent: Install
---



##  Nginx proxy configuration
This is the default nginx configuration for gancio, please modify at least «YOUR_DOMAIN». Note that it does not include HTTPS setup but you can easily use [certbot](https://certbot.eff.org/) for that.

- __You should be in the correct directory__
`/etc/nginx/sites-available`

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
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:13120;
  }
}


```

- __Following this, you should create a link to the file in sites-enabled:__
```bash
ln -s /etc/nginx/sites-available/<your-config> /etc/nginx/sites-enabled/
```


## Optimization (cache and compress)
Create the path where nginx will store cached contents
```bash
mkdir -p /var/cache/nginx/gancio
chown www-data: /var/cache/nginx/gancio
```

### Define the cache zone
Add the directive `proxy_cache_path` that will define the zone `gancio_cache` inside the http section, for example in the main configuration file `/etc/nginx/nginx.conf` or directly in `<your-config>` like in the example below.

```nginx
proxy_cache_path /var/cache/nginx/gancio keys_zone=gancio_cache:1g max_size=80m inactive=1w;
```

- `path` default to /var/cache/nginx/gancio 
- `keys_zone` this folder is accessible using the directive `proxy_cache gancio_cache` inside a server block and has max size of 1g = 1024megabyte
- `max_size`: each file has a max size of 80m (big but maybe tomorrow gancio could support gif or small videos as event images)
- `inactive` if a content initially cached is not requested again in a week, nginx removes it, otherwise the inactive time is reset since the last visit and that content will stay another week

If you run multiple gancio's instances on the same nginx (e.g. a `prod` and a `test` instance) consider using a different name for the `keys_zone` (by default 'gancio_cache'), and then modify accordingly the directive `proxy_cache` in the virtualhost file.

### Add the proxy_cache directive inside the server block

```nginx
proxy_cache_path /var/cache/nginx/gancio keys_zone=gancio_cache:1g max_size=80m inactive=1w use_temp_path=off;

upstream gancio {
  server http://127.0.0.1:13120;
  keepalive 16;
}

server {
  listen 80 http2;
  listen [::]:80;
  server_name <<YOUR_DOMAIN>>;

  sendfile             on;
  client_max_body_size 80m;
  keepalive_timeout    70;

  location / {

    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' blob: data: https://*.openstreetmap.org";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # reverse proxy
    proxy_pass http://gancio;

    # cache    
    proxy_cache_revalidate on;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_cache gancio_cache;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    add_header X-Cache-Status $upstream_cache_status;
    proxy_cache_background_update on;
    proxy_cache_lock on;

    # compression
    gzip on;
    gzip_types      text/html text/plain application/xml application/json text/css application/javascript;
    gzip_min_length 1000;
  }
}
```
