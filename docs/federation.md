---
layout: default
title: Federation
permalink: /federation
nav_order: 9
---

## Federation / ActivityPub

Gancio largely follows ActivityPub's server-to-server specification.


## Supported federation protocols and standards

- [ActivityPub](https://www.w3.org/TR/activitypub/) (Server-to-Server)
- [WebFinger](https://webfinger.net/)
- [HTTP Signatures](https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures)
- [NodeInfo](https://nodeinfo.diaspora.software/)

## Supported FEPs

- [FEP-f1d5: NodeInfo in Fediverse Software](https://codeberg.org/fediverse/fep/src/branch/main/fep/f1d5/fep-f1d5.md)
- [FEP-67ff: FEDERATION.md](https://codeberg.org/fediverse/fep/src/branch/main/fep/67ff/fep-67ff.md)
- [FEP-fb2a: Actor metadata](https://codeberg.org/fediverse/fep/src/branch/main/fep/fb2a/fep-fb2a.md)
- [FEP-2677: Identifying the Application Actor](https://codeberg.org/fediverse/fep/src/branch/main/fep/2677/fep-2677.md)

## ActivityPub

Each instance has only one [AP Actor](https://www.w3.org/TR/activitypub/#actors) of type `Application` named `relay@instance.tld` by default, which publishes each event as [Event](https://www.w3.org/TR/activitystreams-vocabulary/#dfn-event) type.
Each AP enabled software could decide how to interact with coming events, e.g. on Mastodon and forks you can see it with minimal information, with Friendica events are added into your own calendar, GoToSocial does not support [Event](https://www.w3.org/TR/activitystreams-vocabulary/#dfn-event) type.

We are considering the introduction of other `Actor` but they will not be linked to users, rather to places, tags or collections.
There are no personal timeline of people you follow, everyone has a sort of local timeline of the instance, it’s an anti filter-bubble feature.

Since v2.0 each instance could follow other instances or actors (`Admin > Federation > Add trusted node`) and use the events coming from the federation to fill choosen collections (`Admin > Collections`).

Note that events coming from the federation will be removed after the end.

#### Supported operations
All federation's related operations uses `/federation` as endpoint. You can disable it via a specific setting (`Admin > Federation > Disable federation`).


#### Getting followed

#### Received a reply

#### Follow someone

#### Receive an event

