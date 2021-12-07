---
layout: default
title: Embed events in webpages
permalink: /usage/embed
nav_order: 1
parent: Usage
---

## Embed event[s] in your webpage

You can embed a list of filtered events or a specific event card in your webpage using a classic old-school `iframe` or a shiny new webcomponent.

## Webcomponents
Webcomponents usage requires a small (~5kB gzipped) js script to be loaded in your page (note that you should use your instance name):
```html
<script src='https://demo.gancio.org/gancio-events.es.js'></script>
```

### Embed a single event
To embed an event in webpages you use `<gancio-event>` custom element, you can copy the required code in **event's page > Embed > Copy**, should be like the following:

```html
<gancio-event id=17 baseurl='https://demo.gancio.org'></gancio-event>
```

<script src='https://demo.gancio.org/gancio-events.es.js'></script>
<gancio-event id=17 baseurl='https://demo.gancio.org'></gancio-event>  


### Embed event lists
You can also embed a list of events using `<gancio-events>` custom element, you can copy the required code in **Export > List > Copy**


```html
<gancio-events baseurl='https://demo.gancio.org'></gancio-events>
```

<gancio-events baseurl='https://demo.gancio.org'></gancio-events>  

> info "Customize"
> Note that you can modify the title (or completely remove it using an empty `title` param) and the icon,
> you can limit the list to a maximum number of events using the `maxlength` parameter and filter events by `tags` or `places` using that parameters (it's easier using **gancio** than to explain it here)
