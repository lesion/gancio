---
layout: default
title: Custom Javascript
permalink: /usage/custom_js
nav_order: 3
parent: Usage
---

## Custom Javascript <span class='label label-yellow'>Since 1.19.0</span> <span class='label label-red'>BETA</span>

You can integrate some javascript code that will be loaded for each user.

Don't imagine you can accomplish miracles because the templates are not designed to be easily modified,
but don't be afraid to [open an issue](https://framagit.org/les/gancio/-/issues) or even better a PR to add some usage examples to this page.


## Examples:

### Integrate Plausible
```js
var script = document.createElement('script');
script.defer = true;
script.src = "https://plausible.io/js/script.js";
script.dataset.domain = "yourdomain.com";

document.getElementsByTagName('head')[0].appendChild(script);
```


> info "References"
> [#413](https://framagit.org/les/gancio/-/issues/413), [#320](https://framagit.org/les/gancio/-/issues/320)

