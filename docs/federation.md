---
layout: default
title: Federation
permalink: /federation
nav_order: 9
---

## Federation

Each instance has only one [AP Actor](https://www.w3.org/TR/activitypub/#actors) that publishes each event.
We are considering the introduction of other “Actor” but they will not be linked to users, rather to places or tags/categories.
There are no personal homes with a timeline of people I follow, everyone has a sort of local timeline of the instance, it’s an anti filter-bubble feature.

Events are not published with the type `Event` but with type `Note` because we wanted to add the possibility to interact with events from mastodon instances (boost / bookmark and “comments” that we call resources because we don’t want it to become a place of debate, but more a place where to keep a historical memory of events, e.g. an audio recording of a talk).

When mastodon will support `Event` object type we will change for sure.
