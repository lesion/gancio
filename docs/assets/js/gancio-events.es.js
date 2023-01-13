function L() {
}
function W(t) {
  return t();
}
function ee() {
  return /* @__PURE__ */ Object.create(null);
}
function O(t) {
  t.forEach(W);
}
function _e(t) {
  return typeof t == "function";
}
function be(t, e) {
  return t != t ? e == e : t !== e || t && typeof t == "object" || typeof t == "function";
}
let B;
function G(t, e) {
  return B || (B = document.createElement("a")), B.href = e, t === B.href;
}
function xe(t) {
  return Object.keys(t).length === 0;
}
function u(t, e) {
  t.appendChild(e);
}
function v(t, e, i) {
  t.insertBefore(e, i || null);
}
function x(t) {
  t.parentNode.removeChild(t);
}
function pe(t, e) {
  for (let i = 0; i < t.length; i += 1)
    t[i] && t[i].d(e);
}
function g(t) {
  return document.createElement(t);
}
function j(t) {
  return document.createTextNode(t);
}
function z() {
  return j(" ");
}
function ve() {
  return j("");
}
function a(t, e, i) {
  i == null ? t.removeAttribute(e) : t.getAttribute(e) !== i && t.setAttribute(e, i);
}
function $e(t) {
  return Array.from(t.childNodes);
}
function N(t, e) {
  e = "" + e, t.wholeText !== e && (t.data = e);
}
function T(t, e, i) {
  t.classList[i ? "add" : "remove"](e);
}
function ke(t) {
  const e = {};
  for (const i of t)
    e[i.name] = i.value;
  return e;
}
let I;
function R(t) {
  I = t;
}
function Ee() {
  if (!I)
    throw new Error("Function called outside component initialization");
  return I;
}
function we(t) {
  Ee().$$.on_mount.push(t);
}
const H = [], te = [], P = [], ie = [], je = Promise.resolve();
let K = !1;
function Se() {
  K || (K = !0, je.then(y));
}
function Q(t) {
  P.push(t);
}
const J = /* @__PURE__ */ new Set();
let D = 0;
function y() {
  const t = I;
  do {
    for (; D < H.length; ) {
      const e = H[D];
      D++, R(e), ze(e.$$);
    }
    for (R(null), H.length = 0, D = 0; te.length; )
      te.pop()();
    for (let e = 0; e < P.length; e += 1) {
      const i = P[e];
      J.has(i) || (J.add(i), i());
    }
    P.length = 0;
  } while (H.length);
  for (; ie.length; )
    ie.pop()();
  K = !1, J.clear(), R(t);
}
function ze(t) {
  if (t.fragment !== null) {
    t.update(), O(t.before_update);
    const e = t.dirty;
    t.dirty = [-1], t.fragment && t.fragment.p(t.ctx, e), t.after_update.forEach(Q);
  }
}
const Ce = /* @__PURE__ */ new Set();
function Ae(t, e) {
  t && t.i && (Ce.delete(t), t.i(e));
}
function Me(t, e, i, l) {
  const { fragment: n, on_mount: o, on_destroy: r, after_update: f } = t.$$;
  n && n.m(e, i), l || Q(() => {
    const c = o.map(W).filter(_e);
    r ? r.push(...c) : O(c), t.$$.on_mount = [];
  }), f.forEach(Q);
}
function Ne(t, e) {
  const i = t.$$;
  i.fragment !== null && (O(i.on_destroy), i.fragment && i.fragment.d(e), i.on_destroy = i.fragment = null, i.ctx = []);
}
function Te(t, e) {
  t.$$.dirty[0] === -1 && (H.push(t), Se(), t.$$.dirty.fill(0)), t.$$.dirty[e / 31 | 0] |= 1 << e % 31;
}
function ye(t, e, i, l, n, o, r, f = [-1]) {
  const c = I;
  R(t);
  const s = t.$$ = {
    fragment: null,
    ctx: null,
    props: o,
    update: L,
    not_equal: n,
    bound: ee(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(e.context || (c ? c.$$.context : [])),
    callbacks: ee(),
    dirty: f,
    skip_bound: !1,
    root: e.target || c.$$.root
  };
  r && r(s.root);
  let k = !1;
  if (s.ctx = i ? i(t, e.props || {}, (m, _, ...C) => {
    const w = C.length ? C[0] : _;
    return s.ctx && n(s.ctx[m], s.ctx[m] = w) && (!s.skip_bound && s.bound[m] && s.bound[m](w), k && Te(t, m)), _;
  }) : [], s.update(), k = !0, O(s.before_update), s.fragment = l ? l(s.ctx) : !1, e.target) {
    if (e.hydrate) {
      const m = $e(e.target);
      s.fragment && s.fragment.l(m), m.forEach(x);
    } else
      s.fragment && s.fragment.c();
    e.intro && Ae(t.$$.fragment), Me(t, e.target, e.anchor, e.customElement), y();
  }
  R(c);
}
let X;
typeof HTMLElement == "function" && (X = class extends HTMLElement {
  constructor() {
    super(), this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const { on_mount: t } = this.$$;
    this.$$.on_disconnect = t.map(W).filter(_e);
    for (const e in this.$$.slotted)
      this.appendChild(this.$$.slotted[e]);
  }
  attributeChangedCallback(t, e, i) {
    this[t] = i;
  }
  disconnectedCallback() {
    O(this.$$.on_disconnect);
  }
  $destroy() {
    Ne(this, 1), this.$destroy = L;
  }
  $on(t, e) {
    const i = this.$$.callbacks[t] || (this.$$.callbacks[t] = []);
    return i.push(e), () => {
      const l = i.indexOf(e);
      l !== -1 && i.splice(l, 1);
    };
  }
  $set(t) {
    this.$$set && !xe(t) && (this.$$.skip_bound = !0, this.$$set(t), this.$$.skip_bound = !1);
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
function le(t, e, i) {
  const l = t.slice();
  return l[12] = e[i], l;
}
function ne(t, e, i) {
  const l = t.slice();
  return l[15] = e[i], l;
}
function re(t) {
  let e;
  return {
    c() {
      e = g("link"), a(e, "rel", "stylesheet"), a(e, "href", t[4]);
    },
    m(i, l) {
      v(i, e, l);
    },
    p(i, l) {
      l & 16 && a(e, "href", i[4]);
    },
    d(i) {
      i && x(e);
    }
  };
}
function oe(t) {
  let e, i, l = t[1] && t[3] === "true" && ae(t), n = t[5], o = [];
  for (let r = 0; r < n.length; r += 1)
    o[r] = ue(le(t, n, r));
  return {
    c() {
      e = g("div"), l && l.c(), i = z();
      for (let r = 0; r < o.length; r += 1)
        o[r].c();
      a(e, "id", "gancioEvents"), T(e, "dark", t[2] === "dark"), T(e, "light", t[2] === "light"), T(e, "sidebar", t[3] === "true"), T(e, "nosidebar", t[3] !== "true");
    },
    m(r, f) {
      v(r, e, f), l && l.m(e, null), u(e, i);
      for (let c = 0; c < o.length; c += 1)
        o[c].m(e, null);
    },
    p(r, f) {
      if (r[1] && r[3] === "true" ? l ? l.p(r, f) : (l = ae(r), l.c(), l.m(e, i)) : l && (l.d(1), l = null), f & 41) {
        n = r[5];
        let c;
        for (c = 0; c < n.length; c += 1) {
          const s = le(r, n, c);
          o[c] ? o[c].p(s, f) : (o[c] = ue(s), o[c].c(), o[c].m(e, null));
        }
        for (; c < o.length; c += 1)
          o[c].d(1);
        o.length = n.length;
      }
      f & 4 && T(e, "dark", r[2] === "dark"), f & 4 && T(e, "light", r[2] === "light"), f & 8 && T(e, "sidebar", r[3] === "true"), f & 8 && T(e, "nosidebar", r[3] !== "true");
    },
    d(r) {
      r && x(e), l && l.d(), pe(o, r);
    }
  };
}
function ae(t) {
  let e, i, l, n, o, r, f;
  return {
    c() {
      e = g("a"), i = g("div"), l = g("div"), n = j(t[1]), o = z(), r = g("img"), a(l, "class", "title"), a(r, "id", "logo"), a(r, "alt", "logo"), G(r.src, f = t[0] + "/logo.png") || a(r, "src", f), a(i, "class", "content"), a(e, "href", t[0]), a(e, "target", "_blank"), a(e, "id", "header");
    },
    m(c, s) {
      v(c, e, s), u(e, i), u(i, l), u(l, n), u(i, o), u(i, r);
    },
    p(c, s) {
      s & 2 && N(n, c[1]), s & 1 && !G(r.src, f = c[0] + "/logo.png") && a(r, "src", f), s & 1 && a(e, "href", c[0]);
    },
    d(c) {
      c && x(e);
    }
  };
}
function se(t) {
  let e;
  function i(o, r) {
    return o[12].media.length ? Ge : Le;
  }
  let l = i(t), n = l(t);
  return {
    c() {
      e = g("div"), n.c(), a(e, "class", "img");
    },
    m(o, r) {
      v(o, e, r), n.m(e, null);
    },
    p(o, r) {
      l === (l = i(o)) && n ? n.p(o, r) : (n.d(1), n = l(o), n && (n.c(), n.m(e, null)));
    },
    d(o) {
      o && x(e), n.d();
    }
  };
}
function Le(t) {
  let e, i, l;
  return {
    c() {
      e = g("img"), a(e, "style", "aspect-ratio=1.7778;"), a(e, "alt", i = t[12].title), G(e.src, l = t[0] + "/fallbackimage.png") || a(e, "src", l), a(e, "loading", "lazy");
    },
    m(n, o) {
      v(n, e, o);
    },
    p(n, o) {
      o & 32 && i !== (i = n[12].title) && a(e, "alt", i), o & 1 && !G(e.src, l = n[0] + "/fallbackimage.png") && a(e, "src", l);
    },
    d(n) {
      n && x(e);
    }
  };
}
function Ge(t) {
  let e, i, l, n;
  return {
    c() {
      e = g("img"), a(e, "style", i = "object-position: " + de(t[12]) + "; aspect-ratio=1.7778;"), a(e, "alt", l = t[12].media[0].name), G(e.src, n = t[0] + "/media/thumb/" + t[12].media[0].url) || a(e, "src", n), a(e, "loading", "lazy");
    },
    m(o, r) {
      v(o, e, r);
    },
    p(o, r) {
      r & 32 && i !== (i = "object-position: " + de(o[12]) + "; aspect-ratio=1.7778;") && a(e, "style", i), r & 32 && l !== (l = o[12].media[0].name) && a(e, "alt", l), r & 33 && !G(e.src, n = o[0] + "/media/thumb/" + o[12].media[0].url) && a(e, "src", n);
    },
    d(o) {
      o && x(e);
    }
  };
}
function ce(t) {
  let e, i = t[12].tags, l = [];
  for (let n = 0; n < i.length; n += 1)
    l[n] = fe(ne(t, i, n));
  return {
    c() {
      e = g("div");
      for (let n = 0; n < l.length; n += 1)
        l[n].c();
      a(e, "class", "tags");
    },
    m(n, o) {
      v(n, e, o);
      for (let r = 0; r < l.length; r += 1)
        l[r].m(e, null);
    },
    p(n, o) {
      if (o & 32) {
        i = n[12].tags;
        let r;
        for (r = 0; r < i.length; r += 1) {
          const f = ne(n, i, r);
          l[r] ? l[r].p(f, o) : (l[r] = fe(f), l[r].c(), l[r].m(e, null));
        }
        for (; r < l.length; r += 1)
          l[r].d(1);
        l.length = i.length;
      }
    },
    d(n) {
      n && x(e), pe(l, n);
    }
  };
}
function fe(t) {
  let e, i, l = t[15] + "", n;
  return {
    c() {
      e = g("span"), i = j("#"), n = j(l), a(e, "class", "tag");
    },
    m(o, r) {
      v(o, e, r), u(e, i), u(e, n);
    },
    p(o, r) {
      r & 32 && l !== (l = o[15] + "") && N(n, l);
    },
    d(o) {
      o && x(e);
    }
  };
}
function ue(t) {
  let e, i, l, n, o = V(t[12]) + "", r, f, c, s = t[12].title + "", k, m, _, C, w = t[12].place.name + "", d, S, h, b = t[12].place.address + "", A, Y, Z, U, q, $ = t[3] !== "true" && se(t), E = t[12].tags.length && ce(t);
  return {
    c() {
      e = g("a"), $ && $.c(), i = z(), l = g("div"), n = g("div"), r = j(o), f = z(), c = g("div"), k = j(s), m = z(), _ = g("span"), C = j("@"), d = j(w), S = z(), h = g("span"), A = j(b), Y = z(), E && E.c(), Z = z(), a(n, "class", "subtitle"), a(c, "class", "title"), a(h, "class", "subtitle"), a(_, "class", "place"), a(l, "class", "content"), a(e, "href", U = t[0] + "/event/" + (t[12].slug || t[12].id)), a(e, "class", "event"), a(e, "title", q = t[12].title), a(e, "target", "_blank");
    },
    m(p, M) {
      v(p, e, M), $ && $.m(e, null), u(e, i), u(e, l), u(l, n), u(n, r), u(l, f), u(l, c), u(c, k), u(l, m), u(l, _), u(_, C), u(_, d), u(_, S), u(_, h), u(h, A), u(l, Y), E && E.m(l, null), u(e, Z);
    },
    p(p, M) {
      p[3] !== "true" ? $ ? $.p(p, M) : ($ = se(p), $.c(), $.m(e, i)) : $ && ($.d(1), $ = null), M & 32 && o !== (o = V(p[12]) + "") && N(r, o), M & 32 && s !== (s = p[12].title + "") && N(k, s), M & 32 && w !== (w = p[12].place.name + "") && N(d, w), M & 32 && b !== (b = p[12].place.address + "") && N(A, b), p[12].tags.length ? E ? E.p(p, M) : (E = ce(p), E.c(), E.m(l, null)) : E && (E.d(1), E = null), M & 33 && U !== (U = p[0] + "/event/" + (p[12].slug || p[12].id)) && a(e, "href", U), M & 32 && q !== (q = p[12].title) && a(e, "title", q);
    },
    d(p) {
      p && x(e), $ && $.d(), E && E.d();
    }
  };
}
function He(t) {
  let e, i, l = t[4] && re(t), n = t[5].length && oe(t);
  return {
    c() {
      l && l.c(), e = z(), n && n.c(), i = ve(), this.c = L;
    },
    m(o, r) {
      l && l.m(o, r), v(o, e, r), n && n.m(o, r), v(o, i, r);
    },
    p(o, [r]) {
      o[4] ? l ? l.p(o, r) : (l = re(o), l.c(), l.m(e.parentNode, e)) : l && (l.d(1), l = null), o[5].length ? n ? n.p(o, r) : (n = oe(o), n.c(), n.m(i.parentNode, i)) : n && (n.d(1), n = null);
    },
    i: L,
    o: L,
    d(o) {
      l && l.d(o), o && x(e), n && n.d(o), o && x(i);
    }
  };
}
function de(t) {
  if (t.media && t.media[0].focalpoint) {
    const e = t.media[0].focalpoint;
    return `${(e[0] + 1) * 50}% ${(e[1] + 1) * 50}%`;
  }
  return "center center";
}
function Re(t, e, i) {
  let { baseurl: l = "" } = e, { title: n = "" } = e, { maxlength: o = !1 } = e, { tags: r = "" } = e, { places: f = "" } = e, { theme: c = "light" } = e, { show_recurrent: s = !1 } = e, { sidebar: k = "true" } = e, { external_style: m = "" } = e, _ = !1, C = [];
  function w(d) {
    if (!_)
      return;
    const S = [];
    o && S.push(`max=${o}`), r && S.push(`tags=${r}`), f && S.push(`places=${f}`), S.push(`show_recurrent=${s ? "true" : "false"}`), fetch(`${l}/api/events?${S.join("&")}`).then((h) => h.json()).then((h) => {
      i(5, C = h);
    }).catch((h) => {
      console.error("Error loading Gancio API -> ", h);
    });
  }
  return we(() => {
    _ = !0, w();
  }), t.$$set = (d) => {
    "baseurl" in d && i(0, l = d.baseurl), "title" in d && i(1, n = d.title), "maxlength" in d && i(6, o = d.maxlength), "tags" in d && i(7, r = d.tags), "places" in d && i(8, f = d.places), "theme" in d && i(2, c = d.theme), "show_recurrent" in d && i(9, s = d.show_recurrent), "sidebar" in d && i(3, k = d.sidebar), "external_style" in d && i(4, m = d.external_style);
  }, t.$$.update = () => {
    t.$$.dirty & 975 && w();
  }, [
    l,
    n,
    c,
    k,
    m,
    C,
    o,
    r,
    f,
    s
  ];
}
class Ie extends X {
  constructor(e) {
    super(), this.shadowRoot.innerHTML = `<style>#gancioEvents{font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'Noto Color Emoji';overflow-x:hidden;width:100%;box-sizing:content-box;margin:0 auto;font-size:1rem;text-align:left}.nosidebar{max-width:1200px}#header{padding:1.2rem 1rem;background-color:var(--bg-odd-color)}.sidebar{max-width:500px;box-shadow:rgba(60, 64, 67, 0.4) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.25) 0px 1px 3px 1px;border-radius:5px;font-size:1rem}.event .img{width:100%;max-width:450px;max-height:250px;aspect-ratio:1.7778;flex:1 0 auto}@media screen and (max-width: 800px){.event{flex-wrap:wrap}.event .img{max-width:100%}}.event img{object-fit:cover;border-radius:15px;width:100%;height:100%;box-shadow:rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
      rgba(0, 0, 0, 0.3) 0px 3px 7px -3px}.nosidebar .event{margin-bottom:2rem}.nosidebar .content{margin-left:1rem;margin-top:5px;text-align:left}.tags{margin-top:2px}#logo{position:absolute;top:10px;right:10px;height:40px}a{text-decoration:none;color:var(--text-color);display:flex;padding:8px 20px;margin:0;line-height:1.275rem;font-weight:400;font-size:0.875rem;position:relative;transition:background-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1),
      padding 0.3s;box-sizing:content-box}a:hover .title,a:focus .title,a:active .title{text-decoration:underline}.dark{--bg-odd-color:#161616;--bg-even-color:#222;--bg-hover-color:#333;--text-color:white;--title-color:white;--line-color:rgba(120, 120, 120, 0.2)}.light{--bg-odd-color:#f5f5f5;--bg-even-color:#fafafa;--bg-hover-color:#eee;--text-color:#222;--title-color:black;--line-color:rgba(220, 220, 220, 0.9)}.sidebar a{background-color:var(--bg-even-color);border-bottom:1px solid var(--line-color)}.sidebar a:hover,.sidebar a:focus,.sidebar a:active{background-color:var(--bg-hover-color);padding-left:15px;padding-right:25px}.place{font-weight:400;font-size:1.2rem;line-height:1.4rem;color:orangered}.title{color:var(--title-color);font-weight:bold;font-size:1.3rem;line-height:1.1em}.nosidebar .title{font-size:1.9em;line-height:1.1em}.subtitle{font-size:1rem;line-height:1.1em;color:var(--title-color);opacity:0.9}.tag{margin-right:10px;display:inline-block}</style>`, ye(
      this,
      {
        target: this.shadowRoot,
        props: ke(this.attributes),
        customElement: !0
      },
      Re,
      He,
      be,
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
    ), e && (e.target && v(e.target, this, e.anchor), e.props && (this.$set(e.props), y()));
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
  get tags() {
    return this.$$.ctx[7];
  }
  set tags(e) {
    this.$$set({ tags: e }), y();
  }
  get places() {
    return this.$$.ctx[8];
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
    return this.$$.ctx[9];
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
customElements.define("gancio-events", Ie);
function he(t) {
  let e, i, l, n, o = t[1].title + "", r, f, c, s = V(t[1]) + "", k, m, _, C, w = t[1].place.name + "", d, S, h = t[1].media.length && ge(t);
  return {
    c() {
      e = g("a"), h && h.c(), i = z(), l = g("div"), n = g("strong"), r = j(o), f = z(), c = g("div"), k = j(s), m = z(), _ = g("div"), C = j("@"), d = j(w), a(_, "class", "place"), a(l, "class", "container"), a(e, "href", S = t[0] + "/event/" + (t[1].slug || t[1].id)), a(e, "class", "card"), a(e, "target", "_blank");
    },
    m(b, A) {
      v(b, e, A), h && h.m(e, null), u(e, i), u(e, l), u(l, n), u(n, r), u(l, f), u(l, c), u(c, k), u(l, m), u(l, _), u(_, C), u(_, d);
    },
    p(b, A) {
      b[1].media.length ? h ? h.p(b, A) : (h = ge(b), h.c(), h.m(e, i)) : h && (h.d(1), h = null), A & 2 && o !== (o = b[1].title + "") && N(r, o), A & 2 && s !== (s = V(b[1]) + "") && N(k, s), A & 2 && w !== (w = b[1].place.name + "") && N(d, w), A & 3 && S !== (S = b[0] + "/event/" + (b[1].slug || b[1].id)) && a(e, "href", S);
    },
    d(b) {
      b && x(e), h && h.d();
    }
  };
}
function ge(t) {
  let e, i, l, n;
  return {
    c() {
      e = g("img"), G(e.src, i = t[2](t[1])) || a(e, "src", i), a(e, "alt", l = t[1].media[0].name), a(e, "style", n = "object-position: " + me(t[1]) + "; aspect-ratio=1.7778;");
    },
    m(o, r) {
      v(o, e, r);
    },
    p(o, r) {
      r & 2 && !G(e.src, i = o[2](o[1])) && a(e, "src", i), r & 2 && l !== (l = o[1].media[0].name) && a(e, "alt", l), r & 2 && n !== (n = "object-position: " + me(o[1]) + "; aspect-ratio=1.7778;") && a(e, "style", n);
    },
    d(o) {
      o && x(e);
    }
  };
}
function Oe(t) {
  let e, i = t[1] && he(t);
  return {
    c() {
      i && i.c(), e = ve(), this.c = L;
    },
    m(l, n) {
      i && i.m(l, n), v(l, e, n);
    },
    p(l, [n]) {
      l[1] ? i ? i.p(l, n) : (i = he(l), i.c(), i.m(e.parentNode, e)) : i && (i.d(1), i = null);
    },
    i: L,
    o: L,
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
function Ue(t, e, i) {
  let { baseurl: l = "https://demo.gancio.org" } = e, { id: n } = e, o = !1, r;
  function f(s, k) {
    o && fetch(`${k}/api/event/detail/${s}`).then((m) => m.json()).then((m) => i(1, r = m));
  }
  we(() => {
    o = !0, f(n, l);
  });
  function c(s) {
    return `${l}/media/thumb/${s.media[0].url}`;
  }
  return t.$$set = (s) => {
    "baseurl" in s && i(0, l = s.baseurl), "id" in s && i(3, n = s.id);
  }, t.$$.update = () => {
    t.$$.dirty & 9 && f(n, l);
  }, [l, r, c, n];
}
class qe extends X {
  constructor(e) {
    super(), this.shadowRoot.innerHTML = `<style>.card{display:block;font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS',
      sans-serif;box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2);transition:0.3s;border-radius:5px;max-width:500px;text-decoration:none;color:white;background-color:#1e1e1e;overflow:hidden}img{border-radius:5px 5px 0 0;max-height:250px;min-height:160px;width:100%;object-fit:cover;object-position:top}.card:hover .container{padding-left:20px}.card:hover{box-shadow:0 8px 16px 0 rgba(0, 0, 0, 0.2)}.container{transition:padding-left 0.2s;padding:16px}.place{font-weight:600;color:#ff6e40}</style>`, ye(
      this,
      {
        target: this.shadowRoot,
        props: ke(this.attributes),
        customElement: !0
      },
      Ue,
      Oe,
      be,
      { baseurl: 0, id: 3 },
      null
    ), e && (e.target && v(e.target, this, e.anchor), e.props && (this.$set(e.props), y()));
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
customElements.define("gancio-event", qe);
