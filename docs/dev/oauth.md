---
layout: default
title: OAuth
permalink: /dev/oauth
parent: Hacking
nav_order: 4
---

> error "BETA FEATURE"
> Expect bad behavior and open [issues](https://framagit.org/les/gancio/issues)

## OAuth
{: .no_toc }
An open standard for token-based authentication and authorization on the Internet.

Gancio supports OAuth 2.0, an authorization framework described in [RFC 6749](https://tools.ietf.org/html/rfc6749) that allows third-party applications to obtain limited access to an HTTP service on behalf of a resource owner, through the use of a standardized authorization flow that generates a client access token to be used with HTTP requests.

To obtain an OAuth token for a Gancio instance, make sure that you allow your users to specify the domain they want to connect to before login. Use that domain to [acquire a client id/secret](#create-client) and then proceed with normal OAuth 2.

---

## Create client
Create a new application to obtain OAuth2 credentials.

POST
{: .label .label-yellow }
`/api/client`


#### Request parameters

| client_name | `string` | A name for your application |
| redirect_uris | `string` | Where the user should be redirected after authorization |
| scopes | `string` | Space separated list of scopes. If none is provided, defaults to `event:write` as it's the only supported scope!|
| website | `string` | A URL to the homepage of your app |

#### Example
```bash
curl -X POST \
        -d 'client_name=Wordpress Event Manager' \
        -d 'redirect_uris=https://noblogs.org/' \
        -d 'website=https://myapp.example' \
        http://localhost:13120/api/client
```

#### Returns
Application, with `client_id` and `client_secret`

```json
{
   "name" : "Wordpress Event Manager",
   "scopes" : "event:write",
   "website" : "https://myapp.example",
   "client_secret" : "909029fa12797e6bdfb5baf5e379675dfa4e3ad4",
   "redirect_uris" : "https://noblogs.org",
   "client_id" : "0f377e34b2aaf517f7db534f32d26b0dd938fb6d"
}
```

#### List of scopes
- `event:write`  
Grant access to add/update events.

## Authorize a user
Displays an authorization form to the user. If approved, it will create and return an authorization code, then redirect to the desired `redirect_uri`. 
The authorization code can be used while requesting a token to obtain access to user-level methods.

[![/assets/thumbs/oauth_auth.png](/assets/thumbs/oauth_auth.png)](/assets/oauth_auth.png){: data-fancybox="group" data-caption="OAuth authorization form"}


GET
{: .label .label-green}
`/authorize`

#### Request parameters

| response_type | `string` | Should be set equal to `code` |
| redirect_uri | `string` | Where the user should be redirected after authorization |
| scope | `string` | Should be `event:write`|
| client_id | `string` | `client_id`, obtained during app registration. |


## Obtain a token

POST
{: .label .label-yellow }
`/oauth/token`


#### Request parameters

| client_id | `string` | `client_id` obtained during [client registration](#create-client) |
| client_secret | `string` | `client_secret` obtained during [client registration](#create-client) |
| scope | `string` | Should be `event:write`|
| grant_type | `string` | Set equal to `authorization_code` |
| code | `string` | A user authorization code, obtained via [/authorize](#authorize-a-user) |


