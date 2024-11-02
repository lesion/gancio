---
title: Home
nav_order: 1
description: "Gancio is a shared agenda for local communities."
permalink: /
---

# ![](assets/gancio.png) ancio
{: .fs-9 }

A shared agenda for local communities.
{: .fs-6 }
Last release  **[1.20.0 - 2 Nov 2024](/changelog)**

[Install]({% link install/install.md %}){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Demo](https://demo.gancio.org){: .btn .btn-green .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Source](https://framagit.org/les/gancio){: .btn .mb-4 .mb-md-0 .fs-5 }


## Some relevant key features:

- **Focus on content** not on people:
nowhere on gancio does the identity of who posted an event appear, not even under a nickname, not even to administrators (except in the db). This is not an ego-friendly platform.

- **Visitors first**. We do not want logged user to get more features than random visitor. We don't want users to register, except to post events and even then you can post an anonymous event.

- **Anonymous events**: optionally a visitor can create events without being registered (an administrator must confirm them)

- **We don't care about making hits** so we export events in many ways: via RSS feeds, via global or individual ics, allowing you to embed list of events or single event via [iframe or webcomponent]({% link usage/embed.md %}) on other websites, via [AP]({% link federation.md %}), [microdata](https://developer.mozilla.org/en-US/docs/Web/HTML/Microdata) and [microformat](https://developer.mozilla.org/en-US/docs/Web/HTML/microformats#h-event)

- Very easy UI
- Multi-day events (festival, conferences...)
- Recurring events (each monday, each two monday, each monday and friday, each two saturday, etc.)
- Filter events for tags or places
- RSS and ICS export (with filters)
- embed your events in your website with [webcomponents]({% link usage/embed.md %}) or iframe ([example](https://gancio.cisti.org/embed/list?title=Upcoming events))
- boost / bookmark / comment events from the fediverse!
- Lot of configurations available (dark/light theme, user registration open/close, enable federation, enable recurring events)

### License

Gancio is distributed by an [AGPL-3.0 Licence](https://www.gnu.org/licenses/agpl-3.0.en.html).
