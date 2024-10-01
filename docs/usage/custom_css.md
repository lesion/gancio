---
layout: default
title: Custom CSS
permalink: /usage/custom_css
nav_order: 3
parent: Usage
---

## Custom CSS <span class='label label-yellow'>Since 1.19.0</span> <span class='label label-red'>BETA</span>

Is it possible to modify the style by integrating some custom css in `Admin > Theme > Custom CSS`

Don't imagine you can accomplish miracles because the templates are not designed to be easily modified,
but don't be afraid to [open an issue](https://framagit.org/les/gancio/-/issues) or even better a PR to add some css selectors or some usage examples to this page.

Also note that for every element you want to change the style to, you need to overload the style already there: css has an order to choose which one to use, in case of conflict the more specific selector win (or you need to specify !important).

### Remove navbar
```css
#navbar {
    display: none;
}
```

### Fixed navbar
```css
/* fixed navbar */
nav {
 margin-top: 80px;
}

nav > div:first-of-type {
 position: fixed;
 width: 100%;
 top: 0px;
 z-index: 1;
 background-color: #272727;
}

```

### Fixed footer
```css
/* fixed footer */
footer.v-footer {
  position: fixed;
  bottom: 0px;
  width: 100%;
}

div.v-application--wrap {
  margin-bottom: 48px;
} 
```

> info "References"
> [#413](https://framagit.org/les/gancio/-/issues/413)
> [#451](https://framagit.org/les/gancio/-/issues/451)
