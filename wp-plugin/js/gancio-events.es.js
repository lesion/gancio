function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
let src_url_equal_anchor;
function src_url_equal(element_src, url) {
  if (!src_url_equal_anchor) {
    src_url_equal_anchor = document.createElement("a");
  }
  src_url_equal_anchor.href = url;
  return element_src === src_url_equal_anchor.href;
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function append(target, node) {
  target.appendChild(node);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
  for (let i = 0; i < iterations.length; i += 1) {
    if (iterations[i])
      iterations[i].d(detaching);
  }
}
function element(name) {
  return document.createElement(name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.wholeText !== data)
    text2.data = data;
}
function attribute_to_object(attributes) {
  const result = {};
  for (const attribute of attributes) {
    result[attribute.name] = attribute.value;
  }
  return result;
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}
const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
const seen_callbacks = new Set();
let flushidx = 0;
function flush() {
  const saved_component = current_component;
  do {
    while (flushidx < dirty_components.length) {
      const component = dirty_components[flushidx];
      flushidx++;
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
const outroing = new Set();
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, on_mount, on_destroy, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = on_mount.map(run).filter(is_function);
      if (on_destroy) {
        on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }
  set_current_component(parent_component);
}
let SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      const { on_mount } = this.$$;
      this.$$.on_disconnect = on_mount.map(run).filter(is_function);
      for (const key in this.$$.slotted) {
        this.appendChild(this.$$.slotted[key]);
      }
    }
    attributeChangedCallback(attr2, _oldValue, newValue) {
      this[attr2] = newValue;
    }
    disconnectedCallback() {
      run_all(this.$$.on_disconnect);
    }
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i];
  return child_ctx;
}
function create_if_block$1(ctx) {
  let div1;
  let a;
  let div0;
  let span;
  let t0_value = (ctx[1] || "Gancio") + "";
  let t0;
  let t1;
  let img;
  let img_src_value;
  let t2;
  let each_value = ctx[3];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      div1 = element("div");
      a = element("a");
      div0 = element("div");
      span = element("span");
      t0 = text(t0_value);
      t1 = space();
      img = element("img");
      t2 = space();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(span, "id", "headerTitle");
      attr(img, "id", "logo");
      attr(img, "alt", "logo");
      if (!src_url_equal(img.src, img_src_value = "" + (ctx[0] + "/logo.png")))
        attr(img, "src", img_src_value);
      attr(div0, "class", "content");
      attr(a, "href", ctx[0]);
      attr(a, "target", "_blank");
      attr(div1, "id", "gancioEvents");
      attr(div1, "class", ctx[2]);
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, a);
      append(a, div0);
      append(div0, span);
      append(span, t0);
      append(div0, t1);
      append(div0, img);
      append(div1, t2);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].m(div1, null);
      }
    },
    p(ctx2, dirty) {
      if (dirty & 2 && t0_value !== (t0_value = (ctx2[1] || "Gancio") + ""))
        set_data(t0, t0_value);
      if (dirty & 1 && !src_url_equal(img.src, img_src_value = "" + (ctx2[0] + "/logo.png"))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & 1) {
        attr(a, "href", ctx2[0]);
      }
      if (dirty & 9) {
        each_value = ctx2[3];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div1, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty & 4) {
        attr(div1, "class", ctx2[2]);
      }
    },
    d(detaching) {
      if (detaching)
        detach(div1);
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_each_block(ctx) {
  let a;
  let div2;
  let div0;
  let t0_value = when$1(ctx[9].start_datetime) + "";
  let t0;
  let t1;
  let span;
  let t2;
  let t3_value = ctx[9].place.name + "";
  let t3;
  let t4;
  let div1;
  let t5_value = ctx[9].title + "";
  let t5;
  let t6;
  let a_href_value;
  let a_title_value;
  return {
    c() {
      a = element("a");
      div2 = element("div");
      div0 = element("div");
      t0 = text(t0_value);
      t1 = space();
      span = element("span");
      t2 = text("@");
      t3 = text(t3_value);
      t4 = space();
      div1 = element("div");
      t5 = text(t5_value);
      t6 = space();
      attr(span, "class", "place");
      attr(div0, "class", "subtitle");
      attr(div1, "class", "title");
      attr(div2, "class", "content");
      attr(a, "href", a_href_value = "" + (ctx[0] + "/event/" + (ctx[9].slug || ctx[9].id)));
      attr(a, "title", a_title_value = ctx[9].title);
      attr(a, "target", "_blank");
    },
    m(target, anchor) {
      insert(target, a, anchor);
      append(a, div2);
      append(div2, div0);
      append(div0, t0);
      append(div0, t1);
      append(div0, span);
      append(span, t2);
      append(span, t3);
      append(div2, t4);
      append(div2, div1);
      append(div1, t5);
      append(a, t6);
    },
    p(ctx2, dirty) {
      if (dirty & 8 && t0_value !== (t0_value = when$1(ctx2[9].start_datetime) + ""))
        set_data(t0, t0_value);
      if (dirty & 8 && t3_value !== (t3_value = ctx2[9].place.name + ""))
        set_data(t3, t3_value);
      if (dirty & 8 && t5_value !== (t5_value = ctx2[9].title + ""))
        set_data(t5, t5_value);
      if (dirty & 9 && a_href_value !== (a_href_value = "" + (ctx2[0] + "/event/" + (ctx2[9].slug || ctx2[9].id)))) {
        attr(a, "href", a_href_value);
      }
      if (dirty & 8 && a_title_value !== (a_title_value = ctx2[9].title)) {
        attr(a, "title", a_title_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(a);
    }
  };
}
function create_fragment$1(ctx) {
  let if_block_anchor;
  let if_block = ctx[3].length && create_if_block$1(ctx);
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
      this.c = noop;
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (ctx2[3].length) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$1(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function when$1(timestamp) {
  return new Date(timestamp * 1e3).toLocaleDateString(void 0, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function instance$1($$self, $$props, $$invalidate) {
  let { baseurl = "" } = $$props;
  let { title = "Gancio events" } = $$props;
  let { maxlength = false } = $$props;
  let { tags = "" } = $$props;
  let { places = "" } = $$props;
  let { theme = "light" } = $$props;
  let mounted = false;
  let events = [];
  async function update2(v) {
    if (!mounted)
      return;
    const params = [];
    if (maxlength) {
      params.push(`max=${maxlength}`);
    }
    if (tags) {
      params.push(`tags=${tags}`);
    }
    if (places) {
      params.push(`places=${places}`);
    }
    fetch(`${baseurl}/api/events?${params.join("&")}`).then((res) => res.json()).then((e) => {
      $$invalidate(3, events = e);
    }).catch((e) => {
      console.error("Error loading Gancio API -> ", e);
    });
  }
  onMount(() => {
    mounted = true;
    update2();
  });
  $$self.$$set = ($$props2) => {
    if ("baseurl" in $$props2)
      $$invalidate(0, baseurl = $$props2.baseurl);
    if ("title" in $$props2)
      $$invalidate(1, title = $$props2.title);
    if ("maxlength" in $$props2)
      $$invalidate(4, maxlength = $$props2.maxlength);
    if ("tags" in $$props2)
      $$invalidate(5, tags = $$props2.tags);
    if ("places" in $$props2)
      $$invalidate(6, places = $$props2.places);
    if ("theme" in $$props2)
      $$invalidate(2, theme = $$props2.theme);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 118) {
      update2();
    }
  };
  return [baseurl, title, theme, events, maxlength, tags, places];
}
class GancioEvents extends SvelteElement {
  constructor(options) {
    super();
    this.shadowRoot.innerHTML = `<style>#gancioEvents{font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;overflow-x:hidden;font-size:1rem;width:100%;max-width:500px;box-sizing:content-box;box-shadow:rgba(60, 64, 67, 0.4) 0px 1px 2px 0px, rgba(60, 64, 67, 0.25) 0px 1px 3px 1px;border-radius:5px}#logo{position:absolute;top:10px;right:10px;height:40px}#headerTitle{line-height:45px;font-size:1.3rem;font-weight:600}a{text-decoration:none;color:var(--text-color);display:flex;flex-direction:column;flex:1 1 100%;padding:8px 20px;margin:0;line-height:1.275rem;font-weight:400;font-size:.875rem;position:relative;transition:background-color .3s cubic-bezier(.25,.8,.5,1), padding-left .3s;box-sizing:content-box}.dark{--bg-odd-color:#161616;--bg-even-color:#222;--bg-hover-color:#333;--text-color:white;--title-color:white}.light{--bg-odd-color:#f5f5f5;--bg-even-color:#FAFAFA;--bg-hover-color:#EEE;--text-color:#222;--title-color:black}a:nth-child(odd){background-color:var(--bg-odd-color)}a:nth-child(even){background-color:var(--bg-even-color)}a:first-child{border-radius:5px 5px 0px 0px}a:last-child{border-radius:0px 0px 5px 5px;padding-bottom:5px}a:hover{background-color:var(--bg-hover-color);padding-left:23px}.place{font-weight:600;color:#ff6e40}.title{color:var(--title-color)}</style>`;
    init(this, {
      target: this.shadowRoot,
      props: attribute_to_object(this.attributes),
      customElement: true
    }, instance$1, create_fragment$1, safe_not_equal, {
      baseurl: 0,
      title: 1,
      maxlength: 4,
      tags: 5,
      places: 6,
      theme: 2
    }, null);
    if (options) {
      if (options.target) {
        insert(options.target, this, options.anchor);
      }
      if (options.props) {
        this.$set(options.props);
        flush();
      }
    }
  }
  static get observedAttributes() {
    return ["baseurl", "title", "maxlength", "tags", "places", "theme"];
  }
  get baseurl() {
    return this.$$.ctx[0];
  }
  set baseurl(baseurl) {
    this.$$set({ baseurl });
    flush();
  }
  get title() {
    return this.$$.ctx[1];
  }
  set title(title) {
    this.$$set({ title });
    flush();
  }
  get maxlength() {
    return this.$$.ctx[4];
  }
  set maxlength(maxlength) {
    this.$$set({ maxlength });
    flush();
  }
  get tags() {
    return this.$$.ctx[5];
  }
  set tags(tags) {
    this.$$set({ tags });
    flush();
  }
  get places() {
    return this.$$.ctx[6];
  }
  set places(places) {
    this.$$set({ places });
    flush();
  }
  get theme() {
    return this.$$.ctx[2];
  }
  set theme(theme) {
    this.$$set({ theme });
    flush();
  }
}
customElements.define("gancio-events", GancioEvents);
function create_if_block(ctx) {
  let a;
  let t0;
  let div2;
  let strong;
  let t1_value = ctx[1].title + "";
  let t1;
  let t2;
  let div0;
  let t3_value = when(ctx[1]) + "";
  let t3;
  let t4;
  let div1;
  let t5;
  let t6_value = ctx[1].place.name + "";
  let t6;
  let a_href_value;
  let if_block = ctx[1].media.length && create_if_block_1(ctx);
  return {
    c() {
      a = element("a");
      if (if_block)
        if_block.c();
      t0 = space();
      div2 = element("div");
      strong = element("strong");
      t1 = text(t1_value);
      t2 = space();
      div0 = element("div");
      t3 = text(t3_value);
      t4 = space();
      div1 = element("div");
      t5 = text("@");
      t6 = text(t6_value);
      attr(div1, "class", "place");
      attr(div2, "class", "container");
      attr(a, "href", a_href_value = "" + (ctx[0] + "/event/" + (ctx[1].slug || ctx[1].id)));
      attr(a, "class", "card");
      attr(a, "target", "_blank");
    },
    m(target, anchor) {
      insert(target, a, anchor);
      if (if_block)
        if_block.m(a, null);
      append(a, t0);
      append(a, div2);
      append(div2, strong);
      append(strong, t1);
      append(div2, t2);
      append(div2, div0);
      append(div0, t3);
      append(div2, t4);
      append(div2, div1);
      append(div1, t5);
      append(div1, t6);
    },
    p(ctx2, dirty) {
      if (ctx2[1].media.length) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_1(ctx2);
          if_block.c();
          if_block.m(a, t0);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & 2 && t1_value !== (t1_value = ctx2[1].title + ""))
        set_data(t1, t1_value);
      if (dirty & 2 && t3_value !== (t3_value = when(ctx2[1]) + ""))
        set_data(t3, t3_value);
      if (dirty & 2 && t6_value !== (t6_value = ctx2[1].place.name + ""))
        set_data(t6, t6_value);
      if (dirty & 3 && a_href_value !== (a_href_value = "" + (ctx2[0] + "/event/" + (ctx2[1].slug || ctx2[1].id)))) {
        attr(a, "href", a_href_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(a);
      if (if_block)
        if_block.d();
    }
  };
}
function create_if_block_1(ctx) {
  let img;
  let img_src_value;
  let img_alt_value;
  let img_style_value;
  return {
    c() {
      img = element("img");
      if (!src_url_equal(img.src, img_src_value = ctx[2](ctx[1])))
        attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = ctx[1].media[0].name);
      attr(img, "style", img_style_value = "object-position: " + position(ctx[1]) + "; aspect-ratio=1.7778;");
    },
    m(target, anchor) {
      insert(target, img, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & 2 && !src_url_equal(img.src, img_src_value = ctx2[2](ctx2[1]))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & 2 && img_alt_value !== (img_alt_value = ctx2[1].media[0].name)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & 2 && img_style_value !== (img_style_value = "object-position: " + position(ctx2[1]) + "; aspect-ratio=1.7778;")) {
        attr(img, "style", img_style_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(img);
    }
  };
}
function create_fragment(ctx) {
  let if_block_anchor;
  let if_block = ctx[1] && create_if_block(ctx);
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
      this.c = noop;
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (ctx2[1]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function when(event) {
  return new Date(event.start_datetime * 1e3).toLocaleDateString(void 0, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function position(event) {
  if (event.media[0].focalpoint) {
    const focalpoint = event.media[0].focalpoint;
    return `${(focalpoint[0] + 1) * 50}% ${(focalpoint[1] + 1) * 50}%`;
  }
  return "center center";
}
function instance($$self, $$props, $$invalidate) {
  let { baseurl = "https://demo.gancio.org" } = $$props;
  let { id } = $$props;
  let mounted = false;
  let event;
  function update2(id2, baseurl2) {
    if (mounted) {
      fetch(`${baseurl2}/api/event/${id2}`).then((res) => res.json()).then((e) => $$invalidate(1, event = e));
    }
  }
  onMount(() => {
    mounted = true;
    update2(id, baseurl);
  });
  function thumbnail(event2) {
    return `${baseurl}/media/thumb/${event2.media[0].url}`;
  }
  $$self.$$set = ($$props2) => {
    if ("baseurl" in $$props2)
      $$invalidate(0, baseurl = $$props2.baseurl);
    if ("id" in $$props2)
      $$invalidate(3, id = $$props2.id);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 9) {
      update2(id, baseurl);
    }
  };
  return [baseurl, event, thumbnail, id];
}
class GancioEvent extends SvelteElement {
  constructor(options) {
    super();
    this.shadowRoot.innerHTML = `<style>.card{display:block;font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;box-shadow:0 4px 8px 0 rgba(0,0,0,0.2);transition:0.3s;border-radius:5px;max-width:500px;text-decoration:none;color:white;background-color:#1e1e1e;overflow:hidden}img{border-radius:5px 5px 0 0;max-height:250px;min-height:160px;width:100%;object-fit:cover;object-position:top}.card:hover .container{padding-left:20px}.card:hover{box-shadow:0 8px 16px 0 rgba(0,0,0,0.2)}.container{transition:padding-left .2s;padding:16px}.place{font-weight:600;color:#ff6e40}</style>`;
    init(this, {
      target: this.shadowRoot,
      props: attribute_to_object(this.attributes),
      customElement: true
    }, instance, create_fragment, safe_not_equal, { baseurl: 0, id: 3 }, null);
    if (options) {
      if (options.target) {
        insert(options.target, this, options.anchor);
      }
      if (options.props) {
        this.$set(options.props);
        flush();
      }
    }
  }
  static get observedAttributes() {
    return ["baseurl", "id"];
  }
  get baseurl() {
    return this.$$.ctx[0];
  }
  set baseurl(baseurl) {
    this.$$set({ baseurl });
    flush();
  }
  get id() {
    return this.$$.ctx[3];
  }
  set id(id) {
    this.$$set({ id });
    flush();
  }
}
customElements.define("gancio-event", GancioEvent);
