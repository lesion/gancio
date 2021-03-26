---
layout: default
title: Recurrent events
permalink: /usage/recurrent
nav_order: 1
parent: Usage
---

Gancio supports recurrent events if enabled to (`Admin > Settings`,
disabled by default).

![/assets/usage/enable_recurrent.png](/assets/usage/enable_recurrent.png)

When enabled, you are able to create recurrent events. Recurrent
events are not shown by default to visitors, they have to enable it, or you
can choose to show them by default in admin panel.


![/assets/usage/show_recurrent.png](/assets/usage/show_recurrent.png)


## Add a recurrent event

Same as adding a normal event, but you can choose the details of
event recurrence. Choose a frequency first:


![/assets/usage/recurrent_details.png](/assets/usage/recurrent_details.png)

and use the calendar to select one or more days.

![/assets/usage/recurrent_details2.png](/assets/usage/recurrent_details2.png)


## How does it work

Behind the scene, gancio ensures that at least the next three occurrences
of the event are always created. It creates that single events by copying
the properties of the parent event, so if you modify the parent
event's title, or the day of the week, each newly created occurrence will took
the new title and the new selected day. Old occurrences will be preserved.

You can edit a specific event occurrence with more details, a different
poster/flyer, a different title/description or decide to completely hide it.

## Stop/pause a recurrent event (eg. during summer)
A specific menu is shown viewing an instance of recurrent event...

![/assets/usage/recurrent_menu.png](/assets/usage/recurrent_menu.png)

