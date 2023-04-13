function G() {
}
function W(t) {
  return t();
}
function Y() {
  return /* @__PURE__ */ Object.create(null);
}
function U(t) {
  t.forEach(W);
}
function ge(t) {
  return typeof t == "function";
}
function _e(t, e) {
  return t != t ? e == e : t !== e || t && typeof t == "object" || typeof t == "function";
}
let B;
function H(t, e) {
  return B || (B = document.createElement("a")), B.href = e, t === B.href;
}
function ye(t) {
  return Object.keys(t).length === 0;
}
function u(t, e) {
  t.appendChild(e);
}
function p(t, e, i) {
  t.insertBefore(e, i || null);
}
function k(t) {
  t.parentNode.removeChild(t);
}
function be(t, e) {
  for (let i = 0; i < t.length; i += 1)
    t[i] && t[i].d(e);
}
function m(t) {
  return document.createElement(t);
}
function S(t) {
  return document.createTextNode(t);
}
function A() {
  return S(" ");
}
function pe() {
  return S("");
}
function a(t, e, i) {
  i == null ? t.removeAttribute(e) : t.getAttribute(e) !== i && t.setAttribute(e, i);
}
function xe(t) {
  return Array.from(t.childNodes);
}
function T(t, e) {
  e = "" + e, t.wholeText !== e && (t.data = e);
}
function L(t, e, i) {
  t.classList[i ? "add" : "remove"](e);
}
function ve(t) {
  const e = {};
  for (const i of t)
    e[i.name] = i.value;
  return e;
}
let O;
function I(t) {
  O = t;
}
function $e() {
  if (!O)
    throw new Error("Function called outside component initialization");
  return O;
}
function ke(t) {
  $e().$$.on_mount.push(t);
}
const R = [], Z = [], P = [], ee = [], Ee = Promise.resolve();
let K = !1;
function je() {
  K || (K = !0, Ee.then(x));
}
function Q(t) {
  P.push(t);
}
const J = /* @__PURE__ */ new Set();
let D = 0;
function x() {
  const t = O;
  do {
    for (; D < R.length; ) {
      const e = R[D];
      D++, I(e), Se(e.$$);
    }
    for (I(null), R.length = 0, D = 0; Z.length; )
      Z.pop()();
    for (let e = 0; e < P.length; e += 1) {
      const i = P[e];
      J.has(i) || (J.add(i), i());
    }
    P.length = 0;
  } while (R.length);
  for (; ee.length; )
    ee.pop()();
  K = !1, J.clear(), I(t);
}
function Se(t) {
  if (t.fragment !== null) {
    t.update(), U(t.before_update);
    const e = t.dirty;
    t.dirty = [-1], t.fragment && t.fragment.p(t.ctx, e), t.after_update.forEach(Q);
  }
}
const ze = /* @__PURE__ */ new Set();
function Ce(t, e) {
  t && t.i && (ze.delete(t), t.i(e));
}
function Ae(t, e, i, l) {
  const { fragment: n, on_mount: r, on_destroy: o, after_update: f } = t.$$;
  n && n.m(e, i), l || Q(() => {
    const c = r.map(W).filter(ge);
    o ? o.push(...c) : U(c), t.$$.on_mount = [];
  }), f.forEach(Q);
}
function Me(t, e) {
  const i = t.$$;
  i.fragment !== null && (U(i.on_destroy), i.fragment && i.fragment.d(e), i.on_destroy = i.fragment = null, i.ctx = []);
}
function Ne(t, e) {
  t.$$.dirty[0] === -1 && (R.push(t), je(), t.$$.dirty.fill(0)), t.$$.dirty[e / 31 | 0] |= 1 << e % 31;
}
function we(t, e, i, l, n, r, o, f = [-1]) {
  const c = O;
  I(t);
  const s = t.$$ = {
    fragment: null,
    ctx: null,
    props: r,
    update: G,
    not_equal: n,
    bound: Y(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(e.context || (c ? c.$$.context : [])),
    callbacks: Y(),
    dirty: f,
    skip_bound: !1,
    root: e.target || c.$$.root
  };
  o && o(s.root);
  let w = !1;
  if (s.ctx = i ? i(t, e.props || {}, (g, _, ...M) => {
    const y = M.length ? M[0] : _;
    return s.ctx && n(s.ctx[g], s.ctx[g] = y) && (!s.skip_bound && s.bound[g] && s.bound[g](y), w && Ne(t, g)), _;
  }) : [], s.update(), w = !0, U(s.before_update), s.fragment = l ? l(s.ctx) : !1, e.target) {
    if (e.hydrate) {
      const g = xe(e.target);
      s.fragment && s.fragment.l(g), g.forEach(k);
    } else
      s.fragment && s.fragment.c();
    e.intro && Ce(t.$$.fragment), Ae(t, e.target, e.anchor, e.customElement), x();
  }
  I(c);
}
let X;
typeof HTMLElement == "function" && (X = class extends HTMLElement {
  constructor() {
    super(), this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const { on_mount: t } = this.$$;
    this.$$.on_disconnect = t.map(W).filter(ge);
    for (const e in this.$$.slotted)
      this.appendChild(this.$$.slotted[e]);
  }
  attributeChangedCallback(t, e, i) {
    this[t] = i;
  }
  disconnectedCallback() {
    U(this.$$.on_disconnect);
  }
  $destroy() {
    Me(this, 1), this.$destroy = G;
  }
  $on(t, e) {
    const i = this.$$.callbacks[t] || (this.$$.callbacks[t] = []);
    return i.push(e), () => {
      const l = i.indexOf(e);
      l !== -1 && i.splice(l, 1);
    };
  }
  $set(t) {
    this.$$set && !ye(t) && (this.$$.skip_bound = !0, this.$$set(t), this.$$.skip_bound = !1);
  }
});
function F(t, e = "long") {
  const i = e === "long" ? {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  } : { hour: "2-digit", minute: "2-digit" };
  return new Date(t * 1e3).toLocaleString(void 0, i);
}
function V(t) {
  return t.multidate ? F(t.start_datetime) + " - " + F(t.end_datetime) : F(t.start_datetime) + (t.end_datetime ? "-" + F(t.end_datetime, "short") : "");
}
function te(t, e, i) {
  const l = t.slice();
  return l[12] = e[i], l;
}
function ie(t, e, i) {
  const l = t.slice();
  return l[15] = e[i], l;
}
function le(t) {
  let e;
  return {
    c() {
      e = m("link"), a(e, "rel", "stylesheet"), a(e, "href", t[4]);
    },
    m(i, l) {
      p(i, e, l);
    },
    p(i, l) {
      l & 16 && a(e, "href", i[4]);
    },
    d(i) {
      i && k(e);
    }
  };
}
function ne(t) {
  let e, i, l = t[1] && t[3] === "true" && re(t), n = t[5], r = [];
  for (let o = 0; o < n.length; o += 1)
    r[o] = fe(te(t, n, o));
  return {
    c() {
      e = m("div"), l && l.c(), i = A();
      for (let o = 0; o < r.length; o += 1)
        r[o].c();
      a(e, "id", "gancioEvents"), L(e, "dark", t[2] === "dark"), L(e, "light", t[2] === "light"), L(e, "sidebar", t[3] === "true"), L(e, "nosidebar", t[3] !== "true");
    },
    m(o, f) {
      p(o, e, f), l && l.m(e, null), u(e, i);
      for (let c = 0; c < r.length; c += 1)
        r[c].m(e, null);
    },
    p(o, f) {
      if (o[1] && o[3] === "true" ? l ? l.p(o, f) : (l = re(o), l.c(), l.m(e, i)) : l && (l.d(1), l = null), f & 41) {
        n = o[5];
        let c;
        for (c = 0; c < n.length; c += 1) {
          const s = te(o, n, c);
          r[c] ? r[c].p(s, f) : (r[c] = fe(s), r[c].c(), r[c].m(e, null));
        }
        for (; c < r.length; c += 1)
          r[c].d(1);
        r.length = n.length;
      }
      f & 4 && L(e, "dark", o[2] === "dark"), f & 4 && L(e, "light", o[2] === "light"), f & 8 && L(e, "sidebar", o[3] === "true"), f & 8 && L(e, "nosidebar", o[3] !== "true");
    },
    d(o) {
      o && k(e), l && l.d(), be(r, o);
    }
  };
}
function re(t) {
  let e, i, l, n, r, o, f;
  return {
    c() {
      e = m("a"), i = m("div"), l = m("div"), n = S(t[1]), r = A(), o = m("img"), a(l, "class", "title"), a(o, "id", "logo"), a(o, "alt", "logo"), H(o.src, f = t[0] + "/logo.png") || a(o, "src", f), a(i, "class", "content"), a(e, "href", t[0]), a(e, "target", "_blank"), a(e, "id", "header");
    },
    m(c, s) {
      p(c, e, s), u(e, i), u(i, l), u(l, n), u(i, r), u(i, o);
    },
    p(c, s) {
      s & 2 && T(n, c[1]), s & 1 && !H(o.src, f = c[0] + "/logo.png") && a(o, "src", f), s & 1 && a(e, "href", c[0]);
    },
    d(c) {
      c && k(e);
    }
  };
}
function oe(t) {
  let e;
  function i(r, o) {
    return r[12].media.length ? Le : Te;
  }
  let l = i(t), n = l(t);
  return {
    c() {
      e = m("div"), n.c(), a(e, "class", "img");
    },
    m(r, o) {
      p(r, e, o), n.m(e, null);
    },
    p(r, o) {
      l === (l = i(r)) && n ? n.p(r, o) : (n.d(1), n = l(r), n && (n.c(), n.m(e, null)));
    },
    d(r) {
      r && k(e), n.d();
    }
  };
}
function Te(t) {
  let e, i, l;
  return {
    c() {
      e = m("img"), a(e, "style", "aspect-ratio=1.7778;"), a(e, "alt", i = t[12].title), H(e.src, l = t[0] + "/fallbackimage.png") || a(e, "src", l), a(e, "loading", "lazy");
    },
    m(n, r) {
      p(n, e, r);
    },
    p(n, r) {
      r & 32 && i !== (i = n[12].title) && a(e, "alt", i), r & 1 && !H(e.src, l = n[0] + "/fallbackimage.png") && a(e, "src", l);
    },
    d(n) {
      n && k(e);
    }
  };
}
function Le(t) {
  let e, i, l, n;
  return {
    c() {
      e = m("img"), a(e, "style", i = "object-position: " + ue(t[12]) + "; aspect-ratio=1.7778;"), a(e, "alt", l = t[12].media[0].name), H(e.src, n = t[0] + "/media/thumb/" + t[12].media[0].url) || a(e, "src", n), a(e, "loading", "lazy");
    },
    m(r, o) {
      p(r, e, o);
    },
    p(r, o) {
      o & 32 && i !== (i = "object-position: " + ue(r[12]) + "; aspect-ratio=1.7778;") && a(e, "style", i), o & 32 && l !== (l = r[12].media[0].name) && a(e, "alt", l), o & 33 && !H(e.src, n = r[0] + "/media/thumb/" + r[12].media[0].url) && a(e, "src", n);
    },
    d(r) {
      r && k(e);
    }
  };
}
function ae(t) {
  let e, i = t[12].place.address + "", l;
  return {
    c() {
      e = m("span"), l = S(i), a(e, "class", "subtitle");
    },
    m(n, r) {
      p(n, e, r), u(e, l);
    },
    p(n, r) {
      r & 32 && i !== (i = n[12].place.address + "") && T(l, i);
    },
    d(n) {
      n && k(e);
    }
  };
}
function se(t) {
  let e, i = t[12].tags, l = [];
  for (let n = 0; n < i.length; n += 1)
    l[n] = ce(ie(t, i, n));
  return {
    c() {
      e = m("div");
      for (let n = 0; n < l.length; n += 1)
        l[n].c();
      a(e, "class", "tags");
    },
    m(n, r) {
      p(n, e, r);
      for (let o = 0; o < l.length; o += 1)
        l[o].m(e, null);
    },
    p(n, r) {
      if (r & 32) {
        i = n[12].tags;
        let o;
        for (o = 0; o < i.length; o += 1) {
          const f = ie(n, i, o);
          l[o] ? l[o].p(f, r) : (l[o] = ce(f), l[o].c(), l[o].m(e, null));
        }
        for (; o < l.length; o += 1)
          l[o].d(1);
        l.length = i.length;
      }
    },
    d(n) {
      n && k(e), be(l, n);
    }
  };
}
function ce(t) {
  let e, i, l = t[15] + "", n;
  return {
    c() {
      e = m("span"), i = S("#"), n = S(l), a(e, "class", "tag");
    },
    m(r, o) {
      p(r, e, o), u(e, i), u(e, n);
    },
    p(r, o) {
      o & 32 && l !== (l = r[15] + "") && T(n, l);
    },
    d(r) {
      r && k(e);
    }
  };
}
function fe(t) {
  let e, i, l, n, r = V(t[12]) + "", o, f, c, s = t[12].title + "", w, g, _, M, y = t[12].place.name + "", d, z, h, v, C, q, $ = t[3] !== "true" && oe(t), E = t[12].place.name !== "online" && ae(t), j = t[12].tags.length && se(t);
  return {
    c() {
      e = m("a"), $ && $.c(), i = A(), l = m("div"), n = m("div"), o = S(r), f = A(), c = m("div"), w = S(s), g = A(), _ = m("span"), M = S("@"), d = S(y), z = A(), E && E.c(), h = A(), j && j.c(), v = A(), a(n, "class", "subtitle"), a(c, "class", "title"), a(_, "class", "place"), a(l, "class", "content"), a(e, "href", C = t[0] + "/event/" + (t[12].slug || t[12].id)), a(e, "class", "event"), a(e, "title", q = t[12].title), a(e, "target", "_blank");
    },
    m(b, N) {
      p(b, e, N), $ && $.m(e, null), u(e, i), u(e, l), u(l, n), u(n, o), u(l, f), u(l, c), u(c, w), u(l, g), u(l, _), u(_, M), u(_, d), u(_, z), E && E.m(_, null), u(l, h), j && j.m(l, null), u(e, v);
    },
    p(b, N) {
      b[3] !== "true" ? $ ? $.p(b, N) : ($ = oe(b), $.c(), $.m(e, i)) : $ && ($.d(1), $ = null), N & 32 && r !== (r = V(b[12]) + "") && T(o, r), N & 32 && s !== (s = b[12].title + "") && T(w, s), N & 32 && y !== (y = b[12].place.name + "") && T(d, y), b[12].place.name !== "online" ? E ? E.p(b, N) : (E = ae(b), E.c(), E.m(_, null)) : E && (E.d(1), E = null), b[12].tags.length ? j ? j.p(b, N) : (j = se(b), j.c(), j.m(l, null)) : j && (j.d(1), j = null), N & 33 && C !== (C = b[0] + "/event/" + (b[12].slug || b[12].id)) && a(e, "href", C), N & 32 && q !== (q = b[12].title) && a(e, "title", q);
    },
    d(b) {
      b && k(e), $ && $.d(), E && E.d(), j && j.d();
    }
  };
}
function Ge(t) {
  let e, i, l = t[4] && le(t), n = t[5].length && ne(t);
  return {
    c() {
      l && l.c(), e = A(), n && n.c(), i = pe(), this.c = G;
    },
    m(r, o) {
      l && l.m(r, o), p(r, e, o), n && n.m(r, o), p(r, i, o);
    },
    p(r, [o]) {
      r[4] ? l ? l.p(r, o) : (l = le(r), l.c(), l.m(e.parentNode, e)) : l && (l.d(1), l = null), r[5].length ? n ? n.p(r, o) : (n = ne(r), n.c(), n.m(i.parentNode, i)) : n && (n.d(1), n = null);
    },
    i: G,
    o: G,
    d(r) {
      l && l.d(r), r && k(e), n && n.d(r), r && k(i);
    }
  };
}
function ue(t) {
  if (t.media && t.media[0].focalpoint) {
    const e = t.media[0].focalpoint;
    return `${(e[0] + 1) * 50}% ${(e[1] + 1) * 50}%`;
  }
  return "center center";
}
function He(t, e, i) {
  let { baseurl: l = "" } = e, { title: n = "" } = e, { maxlength: r = !1 } = e, { tags: o = "" } = e, { places: f = "" } = e, { theme: c = "light" } = e, { show_recurrent: s = !1 } = e, { sidebar: w = "true" } = e, { external_style: g = "" } = e, _ = !1, M = [];
  function y(d) {
    if (!_)
      return;
    const z = [];
    r && z.push(`max=${r}`), o && z.push(`tags=${o}`), f && z.push(`places=${f}`), z.push(`show_recurrent=${s ? "true" : "false"}`), fetch(`${l}/api/events?${z.join("&")}`).then((h) => h.json()).then((h) => {
      i(5, M = h);
    }).catch((h) => {
      console.error("Error loading Gancio API -> ", h);
    });
  }
  return ke(() => {
    _ = !0, y();
  }), t.$$set = (d) => {
    "baseurl" in d && i(0, l = d.baseurl), "title" in d && i(1, n = d.title), "maxlength" in d && i(6, r = d.maxlength), "tags" in d && i(7, o = d.tags), "places" in d && i(8, f = d.places), "theme" in d && i(2, c = d.theme), "show_recurrent" in d && i(9, s = d.show_recurrent), "sidebar" in d && i(3, w = d.sidebar), "external_style" in d && i(4, g = d.external_style);
  }, t.$$.update = () => {
    t.$$.dirty & 975 && y();
  }, [
    l,
    n,
    c,
    w,
    g,
    M,
    r,
    o,
    f,
    s
  ];
}
class Re extends X {
  constructor(e) {
    super(), this.shadowRoot.innerHTML = `<style>#gancioEvents{font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'Noto Color Emoji';overflow-x:hidden;width:100%;box-sizing:content-box;margin:0 auto;font-size:1rem;text-align:left}.nosidebar{max-width:1200px}#header{padding:1.2rem 1rem;background-color:var(--bg-odd-color)}.sidebar{max-width:500px;box-shadow:rgba(60, 64, 67, 0.4) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.25) 0px 1px 3px 1px;border-radius:5px;font-size:1rem}.event .img{width:100%;max-width:450px;max-height:250px;aspect-ratio:1.7778;flex:1 0 auto}@media screen and (max-width: 800px){.event{flex-wrap:wrap}.event .img{max-width:100%}}.event img{object-fit:cover;border-radius:15px;width:100%;height:100%;box-shadow:rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
      rgba(0, 0, 0, 0.3) 0px 3px 7px -3px}.nosidebar .event{margin-bottom:2rem}.nosidebar .content{margin-left:1rem;margin-top:5px;text-align:left}.tags{margin-top:2px}#logo{position:absolute;top:10px;right:10px;height:40px}a{text-decoration:none;color:var(--text-color);display:flex;padding:8px 20px;margin:0;line-height:1.275rem;font-weight:400;font-size:0.875rem;position:relative;transition:background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1),
      padding 0.3s;box-sizing:content-box}a:hover .title,a:focus .title,a:active .title{text-decoration:underline}.dark{--bg-odd-color:#161616;--bg-even-color:#222;--bg-hover-color:#333;--text-color:white;--title-color:white;--line-color:rgba(120, 120, 120, 0.2)}.light{--bg-odd-color:#f5f5f5;--bg-even-color:#fafafa;--bg-hover-color:#eee;--text-color:#222;--title-color:black;--line-color:rgba(220, 220, 220, 0.9)}.sidebar a{background-color:var(--bg-even-color);border-bottom:1px solid var(--line-color)}.sidebar a:hover,.sidebar a:focus,.sidebar a:active{background-color:var(--bg-hover-color);padding-left:15px;padding-right:25px}.place{font-weight:400;font-size:1.2rem;line-height:1.4rem;color:orangered}.title{color:var(--title-color);font-weight:bold;font-size:1.3rem;line-height:1.1em}.nosidebar .title{font-size:1.9em;line-height:1.1em}.subtitle{font-size:1rem;line-height:1.1em;color:var(--title-color);opacity:0.9}.tag{margin-right:10px;display:inline-block}</style>`, we(
      this,
      {
        target: this.shadowRoot,
        props: ve(this.attributes),
        customElement: !0
      },
      He,
      Ge,
      _e,
      {
        baseurl: 0,
        title: 1,
        maxlength: 6,
        tags: 7,
        places: 8,
        theme: 2,
        show_recurrent: 9,
        sidebar: 3,
        external_style: 4
      },
      null
    ), e && (e.target && p(e.target, this, e.anchor), e.props && (this.$set(e.props), x()));
  }
  static get observedAttributes() {
    return [
      "baseurl",
      "title",
      "maxlength",
      "tags",
      "places",
      "theme",
      "show_recurrent",
      "sidebar",
      "external_style"
    ];
  }
  get baseurl() {
    return this.$$.ctx[0];
  }
  set baseurl(e) {
    this.$$set({ baseurl: e }), x();
  }
  get title() {
    return this.$$.ctx[1];
  }
  set title(e) {
    this.$$set({ title: e }), x();
  }
  get maxlength() {
    return this.$$.ctx[6];
  }
  set maxlength(e) {
    this.$$set({ maxlength: e }), x();
  }
  get tags() {
    return this.$$.ctx[7];
  }
  set tags(e) {
    this.$$set({ tags: e }), x();
  }
  get places() {
    return this.$$.ctx[8];
  }
  set places(e) {
    this.$$set({ places: e }), x();
  }
  get theme() {
    return this.$$.ctx[2];
  }
  set theme(e) {
    this.$$set({ theme: e }), x();
  }
  get show_recurrent() {
    return this.$$.ctx[9];
  }
  set show_recurrent(e) {
    this.$$set({ show_recurrent: e }), x();
  }
  get sidebar() {
    return this.$$.ctx[3];
  }
  set sidebar(e) {
    this.$$set({ sidebar: e }), x();
  }
  get external_style() {
    return this.$$.ctx[4];
  }
  set external_style(e) {
    this.$$set({ external_style: e }), x();
  }
}
customElements.define("gancio-events", Re);
function de(t) {
  let e, i, l, n, r = t[1].title + "", o, f, c, s = V(t[1]) + "", w, g, _, M, y = t[1].place.name + "", d, z, h = t[1].media.length && he(t);
  return {
    c() {
      e = m("a"), h && h.c(), i = A(), l = m("div"), n = m("strong"), o = S(r), f = A(), c = m("div"), w = S(s), g = A(), _ = m("div"), M = S("@"), d = S(y), a(_, "class", "place"), a(l, "class", "container"), a(e, "href", z = t[0] + "/event/" + (t[1].slug || t[1].id)), a(e, "class", "card"), a(e, "target", "_blank");
    },
    m(v, C) {
      p(v, e, C), h && h.m(e, null), u(e, i), u(e, l), u(l, n), u(n, o), u(l, f), u(l, c), u(c, w), u(l, g), u(l, _), u(_, M), u(_, d);
    },
    p(v, C) {
      v[1].media.length ? h ? h.p(v, C) : (h = he(v), h.c(), h.m(e, i)) : h && (h.d(1), h = null), C & 2 && r !== (r = v[1].title + "") && T(o, r), C & 2 && s !== (s = V(v[1]) + "") && T(w, s), C & 2 && y !== (y = v[1].place.name + "") && T(d, y), C & 3 && z !== (z = v[0] + "/event/" + (v[1].slug || v[1].id)) && a(e, "href", z);
    },
    d(v) {
      v && k(e), h && h.d();
    }
  };
}
function he(t) {
  let e, i, l, n;
  return {
    c() {
      e = m("img"), H(e.src, i = t[2](t[1])) || a(e, "src", i), a(e, "alt", l = t[1].media[0].name), a(e, "style", n = "object-position: " + me(t[1]) + "; aspect-ratio=1.7778;");
    },
    m(r, o) {
      p(r, e, o);
    },
    p(r, o) {
      o & 2 && !H(e.src, i = r[2](r[1])) && a(e, "src", i), o & 2 && l !== (l = r[1].media[0].name) && a(e, "alt", l), o & 2 && n !== (n = "object-position: " + me(r[1]) + "; aspect-ratio=1.7778;") && a(e, "style", n);
    },
    d(r) {
      r && k(e);
    }
  };
}
function Ie(t) {
  let e, i = t[1] && de(t);
  return {
    c() {
      i && i.c(), e = pe(), this.c = G;
    },
    m(l, n) {
      i && i.m(l, n), p(l, e, n);
    },
    p(l, [n]) {
      l[1] ? i ? i.p(l, n) : (i = de(l), i.c(), i.m(e.parentNode, e)) : i && (i.d(1), i = null);
    },
    i: G,
    o: G,
    d(l) {
      i && i.d(l), l && k(e);
    }
  };
}
function me(t) {
  if (t.media[0].focalpoint) {
    const e = t.media[0].focalpoint;
    return `${(e[0] + 1) * 50}% ${(e[1] + 1) * 50}%`;
  }
  return "center center";
}
function Oe(t, e, i) {
  let { baseurl: l = "https://demo.gancio.org" } = e, { id: n } = e, r = !1, o;
  function f(s, w) {
    r && fetch(`${w}/api/event/detail/${s}`).then((g) => g.json()).then((g) => i(1, o = g));
  }
  ke(() => {
    r = !0, f(n, l);
  });
  function c(s) {
    return `${l}/media/thumb/${s.media[0].url}`;
  }
  return t.$$set = (s) => {
    "baseurl" in s && i(0, l = s.baseurl), "id" in s && i(3, n = s.id);
  }, t.$$.update = () => {
    t.$$.dirty & 9 && f(n, l);
  }, [l, o, c, n];
}
class Ue extends X {
  constructor(e) {
    super(), this.shadowRoot.innerHTML = `<style>.card{display:block;font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS',
      sans-serif;box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2);transition:0.3s;border-radius:5px;max-width:500px;text-decoration:none;color:white;background-color:#1e1e1e;overflow:hidden}img{border-radius:5px 5px 0 0;max-height:250px;min-height:160px;width:100%;object-fit:cover;object-position:top}.card:hover .container{padding-left:20px}.card:hover{box-shadow:0 8px 16px 0 rgba(0, 0, 0, 0.2)}.container{transition:padding-left 0.2s;padding:16px}.place{font-weight:600;color:#ff6e40}</style>`, we(
      this,
      {
        target: this.shadowRoot,
        props: ve(this.attributes),
        customElement: !0
      },
      Oe,
      Ie,
      _e,
      { baseurl: 0, id: 3 },
      null
    ), e && (e.target && p(e.target, this, e.anchor), e.props && (this.$set(e.props), x()));
  }
  static get observedAttributes() {
    return ["baseurl", "id"];
  }
  get baseurl() {
    return this.$$.ctx[0];
  }
  set baseurl(e) {
    this.$$set({ baseurl: e }), x();
  }
  get id() {
    return this.$$.ctx[3];
  }
  set id(e) {
    this.$$set({ id: e }), x();
  }
}
customElements.define("gancio-event", Ue);
