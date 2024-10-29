---
title: NixOS
permalink: /install/nixos
nav_order: 1
parent: Install
---

## Enable Gancio service on NixOS

Gancio is available as a nixOS service since NixOS 24.11, by default it will use sqlite and nginx (with ssl activated).

#### Example configuration for use with PostgresSQL and Telegram plugin

```nix
{
  pkgs,
  ...
}: {
  services.gancio = {
    enable = true;
    package = pkgs.gancio;
    plugins = [ pkgs.gancioPlugins.telegram-bridge ];
    settings = {
      hostname = "agenda.example.org";
      db.dialect = "postgres";
    };
  };
  networking.firewall.allowedTCPPorts = [ 80 443 ];
}
```
The `services.gancio.settings` attribute is used to generate the configuration file, see [gancio configuration]({% link install/configuration.md %}) for available options.

Other options for the NixOS Gancio service are documented on [search.nixos.org](https://search.nixos.org/options?channel=unstable&query=services.gancio.).

### Additional useful configuration

#### Automatic backup with Restic

Eg. on a nextcloud instance:

```nix
{
  pkgs,
  ...
}: {
  services.restic.backups.gancio = {
    user = "gancio";
    initialize = true;
    repository = "rclone:nextcloud:gancio";
    rcloneConfigFile = /path/to/rclone.config;
    passwordFile = /path/to/restic-backup-password;
    paths = [
      "/var/lib/gancio"
    ];
    backupPrepareCommand = ''
      cd /var/lib/gancio
      ${pkgs.postgresql}/bin/pg_dump -Fc gancio > gancio-db.dump
    '';
    pruneOpts = [
      "--keep-daily 3"
      "--keep-weekly 1"
      "--keep-monthly 1"
    ];
  };
}
```

with `rclone.config` being something like

```ini
[nextcloud]
type = webdav
url = https://nexcloud.example.com/remote.php/dav/files/gancio-backup
vendor = nextcloud
user = gancio-backup
pass = xxxxx
```

#### Intrusion prevention with Fail2Ban

```nix
{
  ...
}: {
  services.fail2ban = {
    enable = true;
    bantime-increment.enable = true;
    jails = {
      nginx-http-auth.settings.enabled = true;
      nginx-botsearch.settings.enabled = true;
      nginx-bad-request.settings.enabled = true;
    };
  };
}
```