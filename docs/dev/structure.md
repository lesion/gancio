---
layout: default
title: Project Structure
permalink: /dev/structure
parent: Hacking
---

### Project structure
{: .no_toc }
1. TOC
{:toc}


### API / backend

Source code inside `server/api/`.  
`index.js` is basically a routing table pointing each PATH with specified
HTTP VERB to a method of a controller.

jwt is used to authenticate api request.

[Express.js](https://expressjs.com/) is based on middleware, passing each request to a chain of methods.

If you come from a PHP background, note that the main difference with
[Node.js](https://en.wikipedia.org/wiki/Node.js) is that the server process is always running and able to manage
multiple requests and tasks together (asyncronically) while each php
process is tied to a single request.

[Sequelize](https://sequelize.org/) is used as ORM. Take a look in [`/server/api/models`](https://git.lattuga.net/cisti/gancio/src/master/server/api/models).


### Client / frontend
Nuxt.js is used here!  
Nuxt is basically Vue plus SSR (Server Side Rendering).
Client routing in nuxt is automatic (if you don't need something special),
just put your page inside `pages` and that's it!  


### Federation / ActivityPub
Code inside [`server/federation`](https://git.lattuga.net/cisti/gancio/src/master/server/federation).