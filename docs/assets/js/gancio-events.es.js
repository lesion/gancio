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
function k(t, e, i) {
  t.insertBefore(e, i || null);
}
function x(t) {
  t.parentNode.removeChild(t);
}
function be(t, e) {
  for (let i = 0; i < t.length; i += 1)
    t[i] && t[i].d(e);
}
function m(t) {
  return document.createElement(t);
}
function z(t) {
  return document.createTextNode(t);
}
function C() {
  return z(" ");
}
function pe() {
  return z("");
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
function Ee() {
  if (!O)
    throw new Error("Function called outside component initialization");
  return O;
}
function ke(t) {
  Ee().$$.on_mount.push(t);
}
const R = [], Z = [], P = [], ee = [], $e = Promise.resolve();
let K = !1;
function je() {
  K || (K = !0, $e.then(y));
}
function Q(t) {
  P.push(t);
}
const J = /* @__PURE__ */ new Set();
let D = 0;
function y() {
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
    const s = r.map(W).filter(ge);
    o ? o.push(...s) : U(s), t.$$.on_mount = [];
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
  const s = O;
  I(t);
  const c = t.$$ = {
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
    context: new Map(e.context || (s ? s.$$.context : [])),
    callbacks: Y(),
    dirty: f,
    skip_bound: !1,
    root: e.target || s.$$.root
  };
  o && o(c.root);
  let w = !1;
  if (c.ctx = i ? i(t, e.props || {}, (g, _, ...A) => {
    const E = A.length ? A[0] : _;
    return c.ctx && n(c.ctx[g], c.ctx[g] = E) && (!c.skip_bound && c.bound[g] && c.bound[g](E), w && Ne(t, g)), _;
  }) : [], c.update(), w = !0, U(c.before_update), c.fragment = l ? l(c.ctx) : !1, e.target) {
    if (e.hydrate) {
      const g = xe(e.target);
      c.fragment && c.fragment.l(g), g.forEach(x);
    } else
      c.fragment && c.fragment.c();
    e.intro && Ce(t.$$.fragment), Ae(t, e.target, e.anchor, e.customElement), y();
  }
  I(s);
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
  return l[13] = e[i], l;
}
function ie(t, e, i) {
  const l = t.slice();
  return l[16] = e[i], l;
}
function le(t) {
  let e;
  return {
    c() {
      e = m("link"), a(e, "rel", "stylesheet"), a(e, "href", t[4]);
    },
    m(i, l) {
      k(i, e, l);
    },
    p(i, l) {
      l & 16 && a(e, "href", i[4]);
    },
    d(i) {
      i && x(e);
    }
  };
}
function ne(t) {
  let e, i, l = t[1] && t[3] === "true" && re(t), n = t[5], r = [];
  for (let o = 0; o < n.length; o += 1)
    r[o] = fe(te(t, n, o));
  return {
    c() {
      e = m("div"), l && l.c(), i = C();
      for (let o = 0; o < r.length; o += 1)
        r[o].c();
      a(e, "id", "gancioEvents"), L(e, "dark", t[2] === "dark"), L(e, "light", t[2] === "light"), L(e, "sidebar", t[3] === "true"), L(e, "nosidebar", t[3] !== "true");
    },
    m(o, f) {
      k(o, e, f), l && l.m(e, null), u(e, i);
      for (let s = 0; s < r.length; s += 1)
        r[s].m(e, null);
    },
    p(o, f) {
      if (o[1] && o[3] === "true" ? l ? l.p(o, f) : (l = re(o), l.c(), l.m(e, i)) : l && (l.d(1), l = null), f & 41) {
        n = o[5];
        let s;
        for (s = 0; s < n.length; s += 1) {
          const c = te(o, n, s);
          r[s] ? r[s].p(c, f) : (r[s] = fe(c), r[s].c(), r[s].m(e, null));
        }
        for (; s < r.length; s += 1)
          r[s].d(1);
        r.length = n.length;
      }
      f & 4 && L(e, "dark", o[2] === "dark"), f & 4 && L(e, "light", o[2] === "light"), f & 8 && L(e, "sidebar", o[3] === "true"), f & 8 && L(e, "nosidebar", o[3] !== "true");
    },
    d(o) {
      o && x(e), l && l.d(), be(r, o);
    }
  };
}
function re(t) {
  let e, i, l, n, r, o, f;
  return {
    c() {
      e = m("a"), i = m("div"), l = m("div"), n = z(t[1]), r = C(), o = m("img"), a(l, "class", "title"), a(o, "id", "logo"), a(o, "alt", "logo"), H(o.src, f = t[0] + "/logo.png") || a(o, "src", f), a(i, "class", "content"), a(e, "href", t[0]), a(e, "target", "_blank"), a(e, "id", "header");
    },
    m(s, c) {
      k(s, e, c), u(e, i), u(i, l), u(l, n), u(i, r), u(i, o);
    },
    p(s, c) {
      c & 2 && T(n, s[1]), c & 1 && !H(o.src, f = s[0] + "/logo.png") && a(o, "src", f), c & 1 && a(e, "href", s[0]);
    },
    d(s) {
      s && x(e);
    }
  };
}
function oe(t) {
  let e;
  function i(r, o) {
    return r[13].media.length ? Le : Te;
  }
  let l = i(t), n = l(t);
  return {
    c() {
      e = m("div"), n.c(), a(e, "class", "img");
    },
    m(r, o) {
      k(r, e, o), n.m(e, null);
    },
    p(r, o) {
      l === (l = i(r)) && n ? n.p(r, o) : (n.d(1), n = l(r), n && (n.c(), n.m(e, null)));
    },
    d(r) {
      r && x(e), n.d();
    }
  };
}
function Te(t) {
  let e, i, l;
  return {
    c() {
      e = m("img"), a(e, "style", "aspect-ratio=1.7778;"), a(e, "alt", i = t[13].title), H(e.src, l = t[0] + "/fallbackimage.png") || a(e, "src", l), a(e, "loading", "lazy");
    },
    m(n, r) {
      k(n, e, r);
    },
    p(n, r) {
      r & 32 && i !== (i = n[13].title) && a(e, "alt", i), r & 1 && !H(e.src, l = n[0] + "/fallbackimage.png") && a(e, "src", l);
    },
    d(n) {
      n && x(e);
    }
  };
}
function Le(t) {
  let e, i, l, n;
  return {
    c() {
      e = m("img"), a(e, "style", i = "object-position: " + ue(t[13]) + "; aspect-ratio=1.7778;"), a(e, "alt", l = t[13].media[0].name), H(e.src, n = t[0] + "/media/thumb/" + t[13].media[0].url) || a(e, "src", n), a(e, "loading", "lazy");
    },
    m(r, o) {
      k(r, e, o);
    },
    p(r, o) {
      o & 32 && i !== (i = "object-position: " + ue(r[13]) + "; aspect-ratio=1.7778;") && a(e, "style", i), o & 32 && l !== (l = r[13].media[0].name) && a(e, "alt", l), o & 33 && !H(e.src, n = r[0] + "/media/thumb/" + r[13].media[0].url) && a(e, "src", n);
    },
    d(r) {
      r && x(e);
    }
  };
}
function ae(t) {
  let e, i = t[13].place.address + "", l;
  return {
    c() {
      e = m("span"), l = z(i), a(e, "class", "subtitle");
    },
    m(n, r) {
      k(n, e, r), u(e, l);
    },
    p(n, r) {
      r & 32 && i !== (i = n[13].place.address + "") && T(l, i);
    },
    d(n) {
      n && x(e);
    }
  };
}
function se(t) {
  let e, i = t[13].tags, l = [];
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
      k(n, e, r);
      for (let o = 0; o < l.length; o += 1)
        l[o].m(e, null);
    },
    p(n, r) {
      if (r & 32) {
        i = n[13].tags;
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
      n && x(e), be(l, n);
    }
  };
}
function ce(t) {
  let e, i, l = t[16] + "", n;
  return {
    c() {
      e = m("span"), i = z("#"), n = z(l), a(e, "class", "tag");
    },
    m(r, o) {
      k(r, e, o), u(e, i), u(e, n);
    },
    p(r, o) {
      o & 32 && l !== (l = r[16] + "") && T(n, l);
    },
    d(r) {
      r && x(e);
    }
  };
}
function fe(t) {
  let e, i, l, n, r = V(t[13]) + "", o, f, s, c = t[13].title + "", w, g, _, A, E = t[13].place.name + "", M, d, h, p, v, q, $ = t[3] !== "true" && oe(t), j = t[13].place.name !== "online" && ae(t), S = t[13].tags.length && se(t);
  return {
    c() {
      e = m("a"), $ && $.c(), i = C(), l = m("div"), n = m("div"), o = z(r), f = C(), s = m("div"), w = z(c), g = C(), _ = m("span"), A = z("@"), M = z(E), d = C(), j && j.c(), h = C(), S && S.c(), p = C(), a(n, "class", "subtitle"), a(s, "class", "title"), a(_, "class", "place"), a(l, "class", "content"), a(e, "href", v = t[0] + "/event/" + (t[13].slug || t[13].id)), a(e, "class", "event"), a(e, "title", q = t[13].title), a(e, "target", "_blank");
    },
    m(b, N) {
      k(b, e, N), $ && $.m(e, null), u(e, i), u(e, l), u(l, n), u(n, o), u(l, f), u(l, s), u(s, w), u(l, g), u(l, _), u(_, A), u(_, M), u(_, d), j && j.m(_, null), u(l, h), S && S.m(l, null), u(e, p);
    },
    p(b, N) {
      b[3] !== "true" ? $ ? $.p(b, N) : ($ = oe(b), $.c(), $.m(e, i)) : $ && ($.d(1), $ = null), N & 32 && r !== (r = V(b[13]) + "") && T(o, r), N & 32 && c !== (c = b[13].title + "") && T(w, c), N & 32 && E !== (E = b[13].place.name + "") && T(M, E), b[13].place.name !== "online" ? j ? j.p(b, N) : (j = ae(b), j.c(), j.m(_, null)) : j && (j.d(1), j = null), b[13].tags.length ? S ? S.p(b, N) : (S = se(b), S.c(), S.m(l, null)) : S && (S.d(1), S = null), N & 33 && v !== (v = b[0] + "/event/" + (b[13].slug || b[13].id)) && a(e, "href", v), N & 32 && q !== (q = b[13].title) && a(e, "title", q);
    },
    d(b) {
      b && x(e), $ && $.d(), j && j.d(), S && S.d();
    }
  };
}
function Ge(t) {
  let e, i, l = t[4] && le(t), n = t[5].length && ne(t);
  return {
    c() {
      l && l.c(), e = C(), n && n.c(), i = pe(), this.c = G;
    },
    m(r, o) {
      l && l.m(r, o), k(r, e, o), n && n.m(r, o), k(r, i, o);
    },
    p(r, [o]) {
      r[4] ? l ? l.p(r, o) : (l = le(r), l.c(), l.m(e.parentNode, e)) : l && (l.d(1), l = null), r[5].length ? n ? n.p(r, o) : (n = ne(r), n.c(), n.m(i.parentNode, i)) : n && (n.d(1), n = null);
    },
    i: G,
    o: G,
    d(r) {
      l && l.d(r), r && x(e), n && n.d(r), r && x(i);
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
  let { baseurl: l = "" } = e, { title: n = "" } = e, { maxlength: r = !1 } = e, { collection: o = "" } = e, { tags: f = "" } = e, { places: s = "" } = e, { theme: c = "light" } = e, { show_recurrent: w = !1 } = e, { sidebar: g = "true" } = e, { external_style: _ = "" } = e, A = !1, E = [];
  function M(d) {
    if (!A)
      return;
    const h = [];
    r && h.push(`max=${r}`);
    let p = "/api/events";
    o ? p = `/feed/json/collection/${o}` : (f && h.push(`tags=${f}`), s && h.push(`places=${s}`)), h.push(`show_recurrent=${w ? "true" : "false"}`), fetch(`${l}${p}?${h.join("&")}`).then((v) => v.json()).then((v) => {
      i(5, E = v.events || v);
    }).catch((v) => {
      console.error("Error loading Gancio API -> ", v);
    });
  }
  return ke(() => {
    A = !0, M();
  }), t.$$set = (d) => {
    "baseurl" in d && i(0, l = d.baseurl), "title" in d && i(1, n = d.title), "maxlength" in d && i(6, r = d.maxlength), "collection" in d && i(7, o = d.collection), "tags" in d && i(8, f = d.tags), "places" in d && i(9, s = d.places), "theme" in d && i(2, c = d.theme), "show_recurrent" in d && i(10, w = d.show_recurrent), "sidebar" in d && i(3, g = d.sidebar), "external_style" in d && i(4, _ = d.external_style);
  }, t.$$.update = () => {
    t.$$.dirty & 1999 && M();
  }, [
    l,
    n,
    c,
    g,
    _,
    E,
    r,
    o,
    f,
    s,
    w
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
        collection: 7,
        tags: 8,
        places: 9,
        theme: 2,
        show_recurrent: 10,
        sidebar: 3,
        external_style: 4
      },
      null
    ), e && (e.target && k(e.target, this, e.anchor), e.props && (this.$set(e.props), y()));
  }
  static get observedAttributes() {
    return [
      "baseurl",
      "title",
      "maxlength",
      "collection",
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
    this.$$set({ baseurl: e }), y();
  }
  get title() {
    return this.$$.ctx[1];
  }
  set title(e) {
    this.$$set({ title: e }), y();
  }
  get maxlength() {
    return this.$$.ctx[6];
  }
  set maxlength(e) {
    this.$$set({ maxlength: e }), y();
  }
  get collection() {
    return this.$$.ctx[7];
  }
  set collection(e) {
    this.$$set({ collection: e }), y();
  }
  get tags() {
    return this.$$.ctx[8];
  }
  set tags(e) {
    this.$$set({ tags: e }), y();
  }
  get places() {
    return this.$$.ctx[9];
  }
  set places(e) {
    this.$$set({ places: e }), y();
  }
  get theme() {
    return this.$$.ctx[2];
  }
  set theme(e) {
    this.$$set({ theme: e }), y();
  }
  get show_recurrent() {
    return this.$$.ctx[10];
  }
  set show_recurrent(e) {
    this.$$set({ show_recurrent: e }), y();
  }
  get sidebar() {
    return this.$$.ctx[3];
  }
  set sidebar(e) {
    this.$$set({ sidebar: e }), y();
  }
  get external_style() {
    return this.$$.ctx[4];
  }
  set external_style(e) {
    this.$$set({ external_style: e }), y();
  }
}
customElements.define("gancio-events", Re);
function de(t) {
  let e, i, l, n, r = t[1].title + "", o, f, s, c = V(t[1]) + "", w, g, _, A, E = t[1].place.name + "", M, d, h = t[1].media.length && he(t);
  return {
    c() {
      e = m("a"), h && h.c(), i = C(), l = m("div"), n = m("strong"), o = z(r), f = C(), s = m("div"), w = z(c), g = C(), _ = m("div"), A = z("@"), M = z(E), a(_, "class", "place"), a(l, "class", "container"), a(e, "href", d = t[0] + "/event/" + (t[1].slug || t[1].id)), a(e, "class", "card"), a(e, "target", "_blank");
    },
    m(p, v) {
      k(p, e, v), h && h.m(e, null), u(e, i), u(e, l), u(l, n), u(n, o), u(l, f), u(l, s), u(s, w), u(l, g), u(l, _), u(_, A), u(_, M);
    },
    p(p, v) {
      p[1].media.length ? h ? h.p(p, v) : (h = he(p), h.c(), h.m(e, i)) : h && (h.d(1), h = null), v & 2 && r !== (r = p[1].title + "") && T(o, r), v & 2 && c !== (c = V(p[1]) + "") && T(w, c), v & 2 && E !== (E = p[1].place.name + "") && T(M, E), v & 3 && d !== (d = p[0] + "/event/" + (p[1].slug || p[1].id)) && a(e, "href", d);
    },
    d(p) {
      p && x(e), h && h.d();
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
      k(r, e, o);
    },
    p(r, o) {
      o & 2 && !H(e.src, i = r[2](r[1])) && a(e, "src", i), o & 2 && l !== (l = r[1].media[0].name) && a(e, "alt", l), o & 2 && n !== (n = "object-position: " + me(r[1]) + "; aspect-ratio=1.7778;") && a(e, "style", n);
    },
    d(r) {
      r && x(e);
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
      i && i.m(l, n), k(l, e, n);
    },
    p(l, [n]) {
      l[1] ? i ? i.p(l, n) : (i = de(l), i.c(), i.m(e.parentNode, e)) : i && (i.d(1), i = null);
    },
    i: G,
    o: G,
    d(l) {
      i && i.d(l), l && x(e);
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
  function f(c, w) {
    r && fetch(`${w}/api/event/detail/${c}`).then((g) => g.json()).then((g) => i(1, o = g));
  }
  ke(() => {
    r = !0, f(n, l);
  });
  function s(c) {
    return `${l}/media/thumb/${c.media[0].url}`;
  }
  return t.$$set = (c) => {
    "baseurl" in c && i(0, l = c.baseurl), "id" in c && i(3, n = c.id);
  }, t.$$.update = () => {
    t.$$.dirty & 9 && f(n, l);
  }, [l, o, s, n];
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
    ), e && (e.target && k(e.target, this, e.anchor), e.props && (this.$set(e.props), y()));
  }
  static get observedAttributes() {
    return ["baseurl", "id"];
  }
  get baseurl() {
    return this.$$.ctx[0];
  }
  set baseurl(e) {
    this.$$set({ baseurl: e }), y();
  }
  get id() {
    return this.$$.ctx[3];
  }
  set id(e) {
    this.$$set({ id: e }), y();
  }
}
customElements.define("gancio-event", Ue);
