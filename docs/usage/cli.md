---
layout: default
title: CLI
permalink: /usage/cli
nav_order: 2
parent: Usage
has_toc: true
---

# CLI - Command Line Interface
{: .no_toc }

1. TOC
{:toc}

## Using CLI
Gancio is distributed with an embedded CLI.
To use the CLI you need to specify the `config.json` configuration file via `--config <your_config.json>` flag; by default the CLI will look for one in the current directory, so if your current directory is /opt/gancio (having followed the [installation instructions](/install/debian)) there is no need to specify it.

### Using CLI with Docker installation
To use the CLI in a docker installation you can execute a shell inside the container with:
`docker exec --workdir /home/node/data -it gancio  sh` and following the normal CLI usage or running commands with:

`docker exec --workdir /home/node/data gancio gancio <your command>`

(the first "gancio" is the container name)


## Users <span class='label label-yellow'>since 1.6.14</span>
All users related sub-commands starts with `gancio users`.
Note that most of this actions could be done from administration panel (Admin > Users).


### List all users
To list all users use
`gancio users list`


### Create a new user

`gancio users create <username|email>`

To create an user with administrator privileges use the `--admin` flag, e.g. `gancio users create admin@example.com --admin`


### Remove a user
`gancio users remove <username|email>`


### Reset password
`gancio users reset-password <username|email>`


### Change administrator privileges

To add administrator privileges to an user:
`gancio users set-admin <username|email>`  

To remove administrator privileges from an user:
`gancio users unset-admin <username|email>`
