---
layout: default
title: Embed events
permalink: /usage/embed
nav_order: 1
parent: Usage
---

## Embed event

You can embed a list of filtered events or a specific event card in your webpage using a classic old-school `iframe` or a shiny new webcomponent.

### Webcomponents
The webcomponent require a small js to be loaded in your page:
```javascript
<script src='https://demo.gancio.org/gancio-events.es.js'></script>
```

#### embed a single event
> you can copy the code in **event page > Embed > Copy**

<script src='https://demo.gancio.org/gancio-events.es.js'></script>
<gancio-event id=17 baseurl='https://demo.gancio.org'></gancio-event>  
```javascript
<gancio-event id=17 baseurl='https://demo.gancio.org'></gancio-event>
```

#### embed event lists
> you can copy the code in **Export > List > Copy**
<gancio-events baseurl='https://demo.gancio.org'></gancio-events>  
```javascript
<gancio-event baseurl='https://demo.gancio.org'></gancio-event>
```