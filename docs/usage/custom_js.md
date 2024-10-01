---
layout: default
title: Custom Javascript
permalink: /usage/custom_js
nav_order: 3
parent: Usage
---

## Custom Javascript <span class='label label-yellow'>Since 1.19.0</span> <span class='label label-red'>BETA</span>

You can integrate some javascript code that will be loaded for each user in `Admin > Theme > Custom JS`

Don't imagine you can accomplish miracles because the templates are not designed to be easily modified,
but don't be afraid to [open an issue](https://framagit.org/les/gancio/-/issues) or even better a PR to add some usage examples to this page.


## Examples:

### Integrate Plausible ([https://plausible.io/](https://plausible.io/))

```js
var script = document.createElement('script');
script.defer = true;
script.src = "https://plausible.io/js/script.js";
script.dataset.domain = "yourdomain.com";

document.getElementsByTagName('head')[0].appendChild(script);
```
### Integrate Umami ([https://umami.is/](https://umami.is/))

```js
    var el = document.createElement('script');
    el.setAttribute('src', 'http://mywebsite.com/umami.js');
    el.setAttribute('data-website-id', 'your-website-id-string-of-numbers');
    document.body.appendChild(el);
```

> info "References"
> [#413](https://framagit.org/les/gancio/-/issues/413), [#320](https://framagit.org/les/gancio/-/issues/320)
[#467](https://framagit.org/les/gancio/-/issues/467)

