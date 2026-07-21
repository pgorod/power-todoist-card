/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis, ue = J.ShadowRoot && (J.ShadyCSS === void 0 || J.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, pe = Symbol(), Te = /* @__PURE__ */ new WeakMap();
let Xe = class {
  constructor(e, t, s) {
    if (this._$cssResult$ = !0, s !== pe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (ue && e === void 0) {
      const s = t !== void 0 && t.length === 1;
      s && (e = Te.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && Te.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const pt = (i) => new Xe(typeof i == "string" ? i : i + "", void 0, pe), ht = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((s, r, n) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + i[n + 1], i[0]);
  return new Xe(t, i, pe);
}, mt = (i, e) => {
  if (ue) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const s = document.createElement("style"), r = J.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = t.cssText, i.appendChild(s);
  }
}, ve = ue ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const s of e.cssRules) t += s.cssText;
  return pt(t);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ft, defineProperty: gt, getOwnPropertyDescriptor: _t, getOwnPropertyNames: bt, getOwnPropertySymbols: yt, getPrototypeOf: $t } = Object, w = globalThis, Ae = w.trustedTypes, wt = Ae ? Ae.emptyScript : "", te = w.reactiveElementPolyfillSupport, O = (i, e) => i, oe = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? wt : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, e) {
  let t = i;
  switch (e) {
    case Boolean:
      t = i !== null;
      break;
    case Number:
      t = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(i);
      } catch {
        t = null;
      }
  }
  return t;
} }, et = (i, e) => !ft(i, e), Se = { attribute: !0, type: String, converter: oe, reflect: !1, useDefault: !1, hasChanged: et };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), w.litPropertyMetadata ?? (w.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let M = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = Se) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(e, s, t);
      r !== void 0 && gt(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, s) {
    const { get: r, set: n } = _t(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: r, set(o) {
      const a = r == null ? void 0 : r.call(this);
      n == null || n.call(this, o), this.requestUpdate(e, a, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Se;
  }
  static _$Ei() {
    if (this.hasOwnProperty(O("elementProperties"))) return;
    const e = $t(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(O("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(O("properties"))) {
      const t = this.properties, s = [...bt(t), ...yt(t)];
      for (const r of s) this.createProperty(r, t[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [s, r] of t) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, s] of this.elementProperties) {
      const r = this._$Eu(t, s);
      r !== void 0 && this._$Eh.set(r, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const r of s) t.unshift(ve(r));
    } else e !== void 0 && t.push(ve(e));
    return t;
  }
  static _$Eu(e, t) {
    const s = t.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((t) => t(this));
  }
  addController(e) {
    var t;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((t = e.hostConnected) == null || t.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const s of t.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return mt(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var s;
      return (s = t.hostConnected) == null ? void 0 : s.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var s;
      return (s = t.hostDisconnected) == null ? void 0 : s.call(t);
    });
  }
  attributeChangedCallback(e, t, s) {
    this._$AK(e, s);
  }
  _$ET(e, t) {
    var n;
    const s = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, s);
    if (r !== void 0 && s.reflect === !0) {
      const o = (((n = s.converter) == null ? void 0 : n.toAttribute) !== void 0 ? s.converter : oe).toAttribute(t, s.type);
      this._$Em = e, o == null ? this.removeAttribute(r) : this.setAttribute(r, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var n, o;
    const s = this.constructor, r = s._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const a = s.getPropertyOptions(r), l = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((n = a.converter) == null ? void 0 : n.fromAttribute) !== void 0 ? a.converter : oe;
      this._$Em = r;
      const c = l.fromAttribute(t, a.type);
      this[r] = c ?? ((o = this._$Ej) == null ? void 0 : o.get(r)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, t, s, r = !1, n) {
    var o;
    if (e !== void 0) {
      const a = this.constructor;
      if (r === !1 && (n = this[e]), s ?? (s = a.getPropertyOptions(e)), !((s.hasChanged ?? et)(n, t) || s.useDefault && s.reflect && n === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(a._$Eu(e, s)))) return;
      this.C(e, t, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: s, reflect: r, wrapped: n }, o) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), n !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (t = void 0), this._$AL.set(e, t)), r === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [n, o] of this._$Ep) this[n] = o;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [n, o] of r) {
        const { wrapped: a } = o, l = this[n];
        a !== !0 || this._$AL.has(n) || l === void 0 || this.C(n, void 0, o, l);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (s = this._$EO) == null || s.forEach((r) => {
        var n;
        return (n = r.hostUpdate) == null ? void 0 : n.call(r);
      }), this.update(t)) : this._$EM();
    } catch (r) {
      throw e = !1, this._$EM(), r;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((s) => {
      var r;
      return (r = s.hostUpdated) == null ? void 0 : r.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
M.elementStyles = [], M.shadowRootOptions = { mode: "open" }, M[O("elementProperties")] = /* @__PURE__ */ new Map(), M[O("finalized")] = /* @__PURE__ */ new Map(), te == null || te({ ReactiveElement: M }), (w.reactiveElementVersions ?? (w.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const L = globalThis, Ee = (i) => i, V = L.trustedTypes, Ce = V ? V.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, tt = "$lit$", $ = `lit$${Math.random().toFixed(9).slice(2)}$`, it = "?" + $, Tt = `<${it}>`, E = document, j = () => E.createComment(""), U = (i) => i === null || typeof i != "object" && typeof i != "function", he = Array.isArray, vt = (i) => he(i) || typeof (i == null ? void 0 : i[Symbol.iterator]) == "function", ie = `[ 	
\f\r]`, I = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Me = /-->/g, xe = />/g, v = RegExp(`>|${ie}(?:([^\\s"'>=/]+)(${ie}*=${ie}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Pe = /'/g, ke = /"/g, st = /^(?:script|style|textarea|title)$/i, At = (i) => (e, ...t) => ({ _$litType$: i, strings: e, values: t }), h = At(1), C = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), De = /* @__PURE__ */ new WeakMap(), A = E.createTreeWalker(E, 129);
function rt(i, e) {
  if (!he(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ce !== void 0 ? Ce.createHTML(e) : e;
}
const St = (i, e) => {
  const t = i.length - 1, s = [];
  let r, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = I;
  for (let a = 0; a < t; a++) {
    const l = i[a];
    let c, u, d = -1, m = 0;
    for (; m < l.length && (o.lastIndex = m, u = o.exec(l), u !== null); ) m = o.lastIndex, o === I ? u[1] === "!--" ? o = Me : u[1] !== void 0 ? o = xe : u[2] !== void 0 ? (st.test(u[2]) && (r = RegExp("</" + u[2], "g")), o = v) : u[3] !== void 0 && (o = v) : o === v ? u[0] === ">" ? (o = r ?? I, d = -1) : u[1] === void 0 ? d = -2 : (d = o.lastIndex - u[2].length, c = u[1], o = u[3] === void 0 ? v : u[3] === '"' ? ke : Pe) : o === ke || o === Pe ? o = v : o === Me || o === xe ? o = I : (o = v, r = void 0);
    const f = o === v && i[a + 1].startsWith("/>") ? " " : "";
    n += o === I ? l + Tt : d >= 0 ? (s.push(c), l.slice(0, d) + tt + l.slice(d) + $ + f) : l + $ + (d === -2 ? a : f);
  }
  return [rt(i, n + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class z {
  constructor({ strings: e, _$litType$: t }, s) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const a = e.length - 1, l = this.parts, [c, u] = St(e, t);
    if (this.el = z.createElement(c, s), A.currentNode = this.el.content, t === 2 || t === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (r = A.nextNode()) !== null && l.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const d of r.getAttributeNames()) if (d.endsWith(tt)) {
          const m = u[o++], f = r.getAttribute(d).split($), _ = /([.?@])?(.*)/.exec(m);
          l.push({ type: 1, index: n, name: _[2], strings: f, ctor: _[1] === "." ? Ct : _[1] === "?" ? Mt : _[1] === "@" ? xt : X }), r.removeAttribute(d);
        } else d.startsWith($) && (l.push({ type: 6, index: n }), r.removeAttribute(d));
        if (st.test(r.tagName)) {
          const d = r.textContent.split($), m = d.length - 1;
          if (m > 0) {
            r.textContent = V ? V.emptyScript : "";
            for (let f = 0; f < m; f++) r.append(d[f], j()), A.nextNode(), l.push({ type: 2, index: ++n });
            r.append(d[m], j());
          }
        }
      } else if (r.nodeType === 8) if (r.data === it) l.push({ type: 2, index: n });
      else {
        let d = -1;
        for (; (d = r.data.indexOf($, d + 1)) !== -1; ) l.push({ type: 7, index: n }), d += $.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const s = E.createElement("template");
    return s.innerHTML = e, s;
  }
}
function P(i, e, t = i, s) {
  var o, a;
  if (e === C) return e;
  let r = s !== void 0 ? (o = t._$Co) == null ? void 0 : o[s] : t._$Cl;
  const n = U(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== n && ((a = r == null ? void 0 : r._$AO) == null || a.call(r, !1), n === void 0 ? r = void 0 : (r = new n(i), r._$AT(i, t, s)), s !== void 0 ? (t._$Co ?? (t._$Co = []))[s] = r : t._$Cl = r), r !== void 0 && (e = P(i, r._$AS(i, e.values), r, s)), e;
}
class Et {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: s } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? E).importNode(t, !0);
    A.currentNode = r;
    let n = A.nextNode(), o = 0, a = 0, l = s[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let c;
        l.type === 2 ? c = new R(n, n.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(n, l.name, l.strings, this, e) : l.type === 6 && (c = new Pt(n, this, e)), this._$AV.push(c), l = s[++a];
      }
      o !== (l == null ? void 0 : l.index) && (n = A.nextNode(), o++);
    }
    return A.currentNode = E, r;
  }
  p(e) {
    let t = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, t), t += s.strings.length - 2) : s._$AI(e[t])), t++;
  }
}
class R {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, s, r) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = s, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = P(this, e, t), U(e) ? e === p || e == null || e === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : e !== this._$AH && e !== C && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : vt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== p && U(this._$AH) ? this._$AA.nextSibling.data = e : this.T(E.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var n;
    const { values: t, _$litType$: s } = e, r = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = z.createElement(rt(s.h, s.h[0]), this.options)), s);
    if (((n = this._$AH) == null ? void 0 : n._$AD) === r) this._$AH.p(t);
    else {
      const o = new Et(r, this), a = o.u(this.options);
      o.p(t), this.T(a), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = De.get(e.strings);
    return t === void 0 && De.set(e.strings, t = new z(e)), t;
  }
  k(e) {
    he(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let s, r = 0;
    for (const n of e) r === t.length ? t.push(s = new R(this.O(j()), this.O(j()), this, this.options)) : s = t[r], s._$AI(n), r++;
    r < t.length && (this._$AR(s && s._$AB.nextSibling, r), t.length = r);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, t); e !== this._$AB; ) {
      const r = Ee(e).nextSibling;
      Ee(e).remove(), e = r;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class X {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, s, r, n) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = p;
  }
  _$AI(e, t = this, s, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = P(this, e, t, 0), o = !U(e) || e !== this._$AH && e !== C, o && (this._$AH = e);
    else {
      const a = e;
      let l, c;
      for (e = n[0], l = 0; l < n.length - 1; l++) c = P(this, a[s + l], t, l), c === C && (c = this._$AH[l]), o || (o = !U(c) || c !== this._$AH[l]), c === p ? e = p : e !== p && (e += (c ?? "") + n[l + 1]), this._$AH[l] = c;
    }
    o && !r && this.j(e);
  }
  j(e) {
    e === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ct extends X {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === p ? void 0 : e;
  }
}
class Mt extends X {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== p);
  }
}
class xt extends X {
  constructor(e, t, s, r, n) {
    super(e, t, s, r, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = P(this, e, t, 0) ?? p) === C) return;
    const s = this._$AH, r = e === p && s !== p || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, n = e !== p && (s === p || r);
    r && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Pt {
  constructor(e, t, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    P(this, e);
  }
}
const se = L.litHtmlPolyfillSupport;
se == null || se(z, R), (L.litHtmlVersions ?? (L.litHtmlVersions = [])).push("3.3.3");
const kt = (i, e, t) => {
  const s = (t == null ? void 0 : t.renderBefore) ?? e;
  let r = s._$litPart$;
  if (r === void 0) {
    const n = (t == null ? void 0 : t.renderBefore) ?? null;
    s._$litPart$ = r = new R(e.insertBefore(j(), n), n, void 0, t ?? {});
  }
  return r._$AI(i), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const S = globalThis;
let x = class extends M {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = kt(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return C;
  }
};
var Ke;
x._$litElement$ = !0, x.finalized = !0, (Ke = S.litElementHydrateSupport) == null || Ke.call(S, { LitElement: x });
const re = S.litElementPolyfillSupport;
re == null || re({ LitElement: x });
(S.litElementVersions ?? (S.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Dt = { CHILD: 2 }, It = (i) => (...e) => ({ _$litDirective$: i, values: e });
class Nt {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, t, s) {
    this._$Ct = e, this._$AM = t, this._$Ci = s;
  }
  _$AS(e, t) {
    return this.update(e, t);
  }
  update(e, t) {
    return this.render(...t);
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class ae extends Nt {
  constructor(e) {
    if (super(e), this.it = p, e.type !== Dt.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(e) {
    if (e === p || e == null) return this._t = void 0, this.it = e;
    if (e === C) return e;
    if (typeof e != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (e === this.it) return this._t;
    this.it = e;
    const t = [e];
    return t.raw = t, this._t = { _$litType$: this.constructor.resultType, strings: t, values: [] };
  }
}
ae.directiveName = "unsafeHTML", ae.resultType = 1;
const Ie = It(ae);
function Ne(i) {
  const e = i == null ? void 0 : i.attributes, t = nt(e), s = [
    e == null ? void 0 : e.tasks,
    e == null ? void 0 : e.items,
    e == null ? void 0 : e.results,
    e == null ? void 0 : e.result,
    e == null ? void 0 : e.data,
    t == null ? void 0 : t.tasks,
    t == null ? void 0 : t.items
  ];
  return ot(s);
}
function me(i) {
  const e = i == null ? void 0 : i.attributes, t = nt(e), s = [
    e == null ? void 0 : e.sections,
    t == null ? void 0 : t.sections,
    e == null ? void 0 : e.project_sections,
    t == null ? void 0 : t.project_sections
  ];
  return ot(s);
}
function Ot(i, e) {
  var n, o;
  const t = e.comments_entity ? (n = i == null ? void 0 : i.states) == null ? void 0 : n[e.comments_entity] : void 0, s = (o = i == null ? void 0 : i.states) == null ? void 0 : o[e.entity], r = t ? t.attributes.results ?? t.attributes.comments ?? t.attributes.items : s == null ? void 0 : s.attributes.project_notes;
  return Ut(r);
}
function Lt(i) {
  var s;
  const e = (s = i == null ? void 0 : i.states) == null ? void 0 : s["sensor.label_colors"];
  if (!e) throw new Error("PowerTodoistCard: sensor.label_colors not found");
  const t = e.attributes.label_colors;
  return Array.isArray(t) ? t : [];
}
function nt(i) {
  return [
    i == null ? void 0 : i.results,
    i == null ? void 0 : i.result,
    i == null ? void 0 : i.data
  ].find(
    (t) => !!t && typeof t == "object" && !Array.isArray(t)
  );
}
function ot(i) {
  const e = i.map(jt).filter(Array.isArray);
  return e.find((t) => t.length > 0) ?? e[0] ?? [];
}
function jt(i) {
  if (Array.isArray(i)) return i;
  if (!i || typeof i != "object") return;
  const e = i;
  return [
    e.tasks,
    e.items,
    e.results,
    e.result,
    e.data,
    e.sections,
    e.project_sections
  ].find(Array.isArray);
}
function Ut(i) {
  if (Array.isArray(i))
    return i.map(Oe).filter((t) => !!t);
  const e = Oe(i);
  return e ? [e] : [];
}
function Oe(i) {
  if (typeof i == "string") return { content: i };
  if (!i || typeof i != "object") return;
  const e = i;
  if (typeof e.content == "string")
    return {
      id: typeof e.id == "string" ? e.id : void 0,
      content: e.content
    };
}
function Z(i, e, t = "", s = "") {
  if (typeof i != "string") return i;
  const r = {
    ...Object.fromEntries(
      Object.entries(e).map(([o, a]) => [o.toLowerCase(), a])
    ),
    "%was%": t,
    "%input%": s,
    "%line%": `
`
  }, n = new RegExp(Object.keys(r).join("|"), "gi");
  return i.replace(n, (o) => r[o.toLowerCase()] ?? o);
}
function zt() {
  const i = /* @__PURE__ */ new Date();
  return `${Math.floor(Math.random() * 99 + 1)}-${Number(i)}-${i.getMilliseconds()}`;
}
function Ht(i, e) {
  const t = Rt(i, e);
  Object.keys(t).forEach((r) => {
    const n = t[r];
    /%[a-zA-Z0-9_-]+%/.test(n) && (t[r] = Z(n, t));
  });
  const s = Z(JSON.stringify(i), Ft(t));
  if (typeof s != "string") return i;
  try {
    return JSON.parse(s);
  } catch {
    return i;
  }
}
function Rt(i, e) {
  var n, o, a, l;
  const t = {
    "%user%": ((n = e == null ? void 0 : e.user) == null ? void 0 : n.name) ?? "",
    "%section%": i.filter_section ?? "",
    "%date%": (/* @__PURE__ */ new Date()).toISOString(),
    "%project_notes%": ""
  };
  Ot(e, i).forEach((c, u) => {
    t[`%project_notes_${u}%`] = c.content, u === 0 && (t["%project_notes%"] = c.content);
  });
  const s = i.relative_day_entity ?? "sensor.dow";
  return (((l = (a = (o = e == null ? void 0 : e.states) == null ? void 0 : o[s]) == null ? void 0 : a.state) == null ? void 0 : l.split(", ")) ?? []).forEach((c, u) => {
    t[`%dow${u - 1}%`] = (c == null ? void 0 : c.replaceAll("'", "")) ?? "";
  }), t;
}
function Ft(i) {
  return Object.fromEntries(
    Object.entries(i).map(([e, t]) => [e, JSON.stringify(t).slice(1, -1)])
  );
}
function Bt(i, e) {
  return Jt(Wt([...i], e), e);
}
function Wt(i, e) {
  if (e.sort_by_due_date !== void 0 && e.sort_by_due_date !== !1 && i.sort((r, n) => r.due && n.due ? e.sort_by_due_date === "ascending" ? new Date(r.due.date).getTime() - new Date(n.due.date).getTime() : new Date(n.due.date).getTime() - new Date(r.due.date).getTime() : 0), e.filter_show_dates_starting === void 0 && e.filter_show_dates_ending === void 0)
    return i;
  let t = Number(e.filter_show_dates_starting), s = Number(e.filter_show_dates_ending);
  return typeof e.filter_show_dates_starting == "string" && !Number.isNaN(t) ? t = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0) + t * 24 * 60 * 60 * 1e3 : t = Date.now() + t * 60 * 60 * 1e3, typeof e.filter_show_dates_ending == "string" && !Number.isNaN(s) ? s = (/* @__PURE__ */ new Date()).setHours(23, 59, 59, 999) + s * 24 * 60 * 60 * 1e3 : s = Date.now() + s * 60 * 60 * 1e3, i.filter((r) => {
    if (!r.due) return e.filter_show_dates_empty !== !1;
    const n = qt(r), [o, a] = Vt(r.due.date);
    Number.isNaN(s) && n && (t -= n, s = Date.now());
    const l = Number.isNaN(t) || t <= a, c = Number.isNaN(s) || s >= o;
    return l && c;
  });
}
function Jt(i, e) {
  return e.sort_by_priority !== void 0 && e.sort_by_priority !== !1 && i.sort((t, s) => t.priority && s.priority ? e.sort_by_priority === "ascending" ? t.priority - s.priority : s.priority - t.priority : 0), i;
}
function qt(i) {
  return i.duration ? i.duration.unit === "day" ? i.duration.amount * 24 * 60 * 60 * 1e3 : i.duration.amount * 60 * 1e3 : 0;
}
function Vt(i) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(i))
    return [
      (/* @__PURE__ */ new Date(`${i}T00:00:00`)).getTime(),
      (/* @__PURE__ */ new Date(`${i}T23:59:59`)).getTime()
    ];
  const e = new Date(i).getTime();
  return [e, e];
}
const Zt = {
  [-1]: "Ontem",
  0: "Hoje",
  1: "Amanhã",
  2: "Depois de amanhã"
};
function Qt(i, e, t = {}) {
  const s = Gt(t.sourceToken) ?? Yt(i, e, t.entityId);
  if (s === void 0) return i;
  const r = Zt[s] ?? `Daqui a ${s} dias`;
  return `${i} (${r})`;
}
function Yt(i, e, t = "sensor.dow") {
  const s = Kt(e, t), r = Le(i), n = s.findIndex((o) => Le(o) === r);
  if (!(n < 0))
    return n - 1;
}
function Gt(i) {
  if (typeof i != "string") return;
  const e = i.match(/%dow(-?\d+)%/i);
  if (e)
    return Number(e[1]);
}
function Kt(i, e) {
  var t, s, r;
  return ((r = (s = (t = i == null ? void 0 : i.states) == null ? void 0 : t[e]) == null ? void 0 : s.state) == null ? void 0 : r.split(", ").map((n) => n.replaceAll("'", "").trim()).filter(Boolean)) ?? [];
}
function Le(i) {
  return i.trim().toLocaleLowerCase("pt-PT");
}
const at = "🗓", je = {
  default: "ddd mmm dd yyyy HH:MM:ss",
  shortDate: "m/d/yy",
  mediumDate: "mmm d, yyyy",
  longDate: "mmmm d, yyyy",
  fullDate: "dddd, mmmm d, yyyy",
  shortTime: "h:MM TT",
  mediumTime: "h:MM:ss TT",
  longTime: "h:MM:ss TT Z",
  isoDate: "yyyy-mm-dd",
  isoTime: "HH:MM:ss",
  isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
  isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
}, Ue = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
], ze = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
], Xt = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;
function ei(i, e) {
  if (!(!e.show_dates || !i.due))
    return ii(i.due.datetime ?? i.due.date, e.date_format);
}
function ti(i) {
  return i.startsWith(at);
}
function ii(i, e) {
  return `${at}${lt(i, e || "dd-mmm H'h'MM")}`;
}
function lt(i, e, t = !1) {
  let s = je[e] || e || je.default;
  s.startsWith("UTC:") && (s = s.slice(4), t = !0);
  const r = si(i);
  if (Number.isNaN(r.getTime())) throw new SyntaxError("invalid date");
  const n = t ? "getUTC" : "get", o = r[`${n}Date`](), a = r[`${n}Day`](), l = r[`${n}Month`](), c = r[`${n}FullYear`](), u = r[`${n}Hours`](), d = r[`${n}Minutes`](), m = r[`${n}Seconds`](), f = r[`${n}Milliseconds`](), _ = t ? 0 : r.getTimezoneOffset(), D = {
    d: o,
    dd: b(o),
    ddd: Ue[a],
    dddd: Ue[a + 7],
    m: l + 1,
    mm: b(l + 1),
    mmm: ze[l],
    mmmm: ze[l + 12],
    yy: String(c).slice(2),
    yyyy: c,
    h: u % 12 || 12,
    hh: b(u % 12 || 12),
    H: u,
    HH: b(u),
    M: d,
    MM: b(d),
    s: m,
    ss: b(m),
    l: b(f, 3),
    L: b(f > 99 ? Math.round(f / 10) : f),
    t: u < 12 ? "a" : "p",
    tt: u < 12 ? "am" : "pm",
    T: u < 12 ? "A" : "P",
    TT: u < 12 ? "AM" : "PM",
    Z: t ? "UTC" : ri(r),
    o: `${_ > 0 ? "-" : "+"}${b(Math.floor(Math.abs(_) / 60) * 100 + Math.abs(_) % 60, 4)}`,
    S: ["th", "st", "nd", "rd"][o % 10 > 3 ? 0 : +(o % 100 - o % 10 !== 10) * (o % 10)]
  };
  return s.replace(
    Xt,
    (T) => T in D ? String(D[T]) : T.slice(1, T.length - 1)
  );
}
function si(i) {
  return i instanceof Date ? i : /^\d{4}-\d{2}-\d{2}$/.test(i) ? /* @__PURE__ */ new Date(`${i}T00:00:00`) : new Date(i);
}
function b(i, e = 2) {
  let t = String(i);
  for (; t.length < e; ) t = `0${t}`;
  return t;
}
function ri(i) {
  var e;
  return ((e = (String(i).match(/\b(?:GMT|UTC)(?:[-+]\d{4})?\b/g) || [""]).pop()) == null ? void 0 : e.replace(/[^-+\dA-Z]/g, "")) ?? "";
}
function ni(i, e) {
  if (!i) return "";
  const t = oi(i, e);
  return ci(t);
}
function oi(i, e) {
  return i.replace(/\{\{(.+?)\}\}/g, (t, s) => {
    try {
      return ai(s.trim(), e);
    } catch {
      return `[${s.trim()}]`;
    }
  });
}
function ai(i, e, t = /* @__PURE__ */ new Date()) {
  var o, a, l, c, u, d;
  const s = i.match(/now\(\)\.strftime\(['"](.+?)['"]\)/);
  if (s) return lt(t, li(s[1]));
  if (i === "user") return ((o = e == null ? void 0 : e.user) == null ? void 0 : o.name) || "unknown";
  const r = i.match(/states\(['"](.+?)['"]\)/);
  if (r) return ((l = (a = e == null ? void 0 : e.states) == null ? void 0 : a[r[1]]) == null ? void 0 : l.state) || "unavailable";
  const n = i.match(/state_attr\(['"](.+?)['"],\s*['"](.+?)['"]\)/);
  if (n) {
    const m = (d = (u = (c = e == null ? void 0 : e.states) == null ? void 0 : c[n[1]]) == null ? void 0 : u.attributes) == null ? void 0 : d[n[2]];
    return m == null ? "" : String(m);
  }
  throw new Error(`Unsupported expression: ${i}`);
}
function li(i) {
  return i.replace(/%d/g, "dd").replace(/%m/g, "mm").replace(/%Y/g, "yyyy").replace(/%H/g, "HH").replace(/%M/g, "MM").replace(/%S/g, "ss").replace(/%B/g, "mmmm").replace(/%b/g, "mmm").replace(/%A/g, "dddd").replace(/%a/g, "ddd").replace(/%I/g, "hh").replace(/%p/g, "TT");
}
function ci(i) {
  return i.replace(/\r\n/g, `
`).split(/\n{2,}/).map(di).filter(Boolean).join(`
`);
}
function di(i) {
  const e = i.split(`
`), t = i.trim();
  if (!t) return "";
  const s = t.match(/^(#{1,6})\s+(.+)$/);
  if (s) {
    const r = s[1].length;
    return `<h${r}>${F(s[2].trim())}</h${r}>`;
  }
  return e.every((r) => /^\s*[-*]\s+/.test(r)) ? `<ul>${e.map((n) => n.replace(/^\s*[-*]\s+/, "")).map((n) => `<li>${F(n)}</li>`).join("")}</ul>` : e.every((r) => /^\s*\d+\.\s+/.test(r)) ? `<ol>${e.map((n) => n.replace(/^\s*\d+\.\s+/, "")).map((n) => `<li>${F(n)}</li>`).join("")}</ol>` : `<p>${e.map((r) => F(r)).join("<br>")}</p>`;
}
function F(i) {
  let e = ui(i);
  return e = e.replace(/`([^`]+)`/g, "<code>$1</code>"), e = e.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"), e = e.replace(/\*([^*]+)\*/g, "<em>$1</em>"), e = e.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
  ), e;
}
function ui(i) {
  return i.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function pi(i, e, t, s) {
  if (!e) return t;
  const r = i.labels ?? [];
  let n = 0, o = 0;
  return e.forEach((a) => {
    if (a.startsWith("!")) {
      o += r.includes(a.slice(1)) ? 1 : 0;
      return;
    }
    n += r.includes(a) || a === "*" ? 1 : 0, n += a === "!*" && r.length === 0 ? 1 : 0;
  }), o === 0 && n > 0;
}
function hi(i, e) {
  return i.map((t) => ({
    ...t,
    statusFromLabelCriteria: pi(t, e.status_from_labels, !1)
  }));
}
function mi(i, e, t, s) {
  const r = i.labels ?? [], n = ei(i, e), o = fi(r, e, s);
  if (e.show_item_labels === !1) return [n, ...o].filter(He);
  const a = [n, ...r, ...o].filter(He), l = /* @__PURE__ */ new Set([
    ...t.length === 1 ? t : [],
    ...a.filter((c) => c.startsWith("_") && !c.endsWith("_outline"))
  ]);
  return a.filter((c) => !l.has(c));
}
function He(i) {
  return typeof i == "string" && i.length > 0;
}
function fi(i, e, t) {
  var r;
  const s = [];
  return (r = e.extra_labels) == null || r.forEach((n) => {
    const o = n.split(/[:+]/).map((d) => d.trim()).filter(Boolean), a = o[0];
    if (!a) return;
    const l = n.split(":").map((d) => d.trim());
    let c = o.slice(1).filter((d) => i.includes(d));
    if (l.length > 1 && l[1].startsWith("+") && (c = c.length > 0 ? [String(c.length)] : []), !c.length && n.includes(":")) return;
    const u = t.some((d) => d.name === `${a}_outline`);
    s.push(`${a}: ${c.join("+")}${u ? "_outline" : ""}`);
  }), s;
}
function gi(i, e) {
  var r;
  if (i.filter_section_id) return i.filter_section_id;
  const t = i.filter_section;
  if (!t || t === "!*") return;
  const s = Y(t);
  return (r = me(e).find((n) => Y(n.name) === s)) == null ? void 0 : r.id;
}
function _i(i, e, t) {
  return e.filter_section === "!*" ? i.filter((s) => !Re(s) && !Fe(s)) : t ? i.filter(
    (s) => Q(Re(s)) === Q(t) || Y(Fe(s) ?? "") === Y(e.filter_section ?? "")
  ) : i;
}
function bi(i, e) {
  const t = [];
  return i.filter_labels && e.forEach((s) => {
    var n;
    const r = s.labels ?? [];
    (n = i.filter_labels) == null || n.forEach((o) => {
      !o.startsWith("!") && (r.includes(o) || o === "*") && (t.includes(o) || t.push(o));
    });
  }), t;
}
function yi(i, e, t) {
  var s;
  return i.name || i.friendly_name || ((s = me(e).find((r) => Q(r.id) === Q(t))) == null ? void 0 : s.name) || i.filter_section || "ToDoist";
}
function Q(i) {
  return i == null ? "" : String(i);
}
function Re(i) {
  const e = i;
  if (e.section_id !== void 0 && e.section_id !== null) return e.section_id;
  if (e.sectionId !== void 0 && e.sectionId !== null) return e.sectionId;
  if (e.section && typeof e.section == "object") return e.section.id;
}
function Fe(i) {
  const e = i;
  if (typeof e.section_name == "string") return e.section_name;
  if (typeof e.sectionName == "string") return e.sectionName;
  if (typeof e.section == "string") return e.section;
  if (e.section && typeof e.section == "object" && typeof e.section.name == "string")
    return e.section.name;
}
function Y(i) {
  return i.normalize("NFKC").replace(/\s+/g, " ").trim().toLocaleLowerCase("pt-PT");
}
function $i(i) {
  return i.accent ? "left-accent" : "";
}
function wi(i) {
  const e = N(i.line_size, 40), t = N(i.font_size, 16), s = N(i.icon_size, 24), r = Math.max(e, s + 16), n = N(i.line_padding_top, 0), o = N(i.line_padding_bottom, 0);
  return [
    `--pt-item-line-size: ${r}px`,
    `--pt-item-font-size: ${t}px`,
    `--pt-icon-size: ${s}px`,
    `--pt-line-padding-top: ${n}px`,
    `--pt-line-padding-bottom: ${o}px`,
    `--pt-accent-color: ${i.accent || "var(--primary-color, #149514)"}`
  ].join("; ");
}
function N(i, e) {
  return typeof i == "number" && Number.isFinite(i) ? i : typeof i == "string" && i.trim() && Number.isFinite(Number(i)) ? Number(i) : e;
}
const le = {
  berry_red: "rgb(184, 37, 111)",
  red: "rgb(219, 64, 53)",
  orange: "rgb(255, 153, 51)",
  yellow: "rgb(250, 208, 0)",
  olive_green: "rgb(175, 184, 59)",
  lime_green: "rgb(126, 204, 73)",
  green: "rgb(41, 148, 56)",
  mint_green: "rgb(106, 204, 188)",
  teal: "rgb(21, 143, 173)",
  sky_blue: "rgb(20, 170, 245)",
  light_blue: "rgb(150, 195, 235)",
  blue: "rgb(64, 115, 255)",
  grape: "rgb(136, 77, 255)",
  violet: "rgb(175, 56, 235)",
  lavender: "rgb(235, 150, 235)",
  magenta: "rgb(224, 81, 148)",
  salmon: "rgb(255, 141, 133)",
  charcoal: "rgb(128, 128, 128)",
  grey: "rgb(184, 184, 184)",
  taupe: "rgb(204, 172, 147)",
  black: "rgb(0, 0, 0)",
  white: "rgb(255, 255, 255)"
};
function q(i, e = "grey") {
  return i && fe(i) ? le[i] : le[e];
}
function fe(i) {
  return typeof i == "string" && Object.prototype.hasOwnProperty.call(le, i);
}
const H = [
  "checkbox-marked-circle-outline:green",
  "circle-medium",
  "plus-outline:blue",
  "trash-can-outline:red",
  "checkbox-marked-circle-outline",
  "checkbox-blank-circle-outline"
];
function Ti(i, e) {
  return ct(i)[e] ?? G(H[e] ?? H[0]);
}
function vi(i, e) {
  const t = ct(e);
  return e.status_from_labels !== void 0 && i.statusFromLabelCriteria !== void 0 && t.length >= 6 ? i.statusFromLabelCriteria ? t[4] : t[5] : t[0];
}
function ct(i) {
  return (Array.isArray(i.icons) && i.icons.length >= 4 ? i.icons : H).map((t) => G(t));
}
function G(i) {
  if (typeof i != "string") return G(H[0]);
  const [e, ...t] = i.split(":"), s = e.trim() || G(H[0]).name, r = t.join(":").trim();
  return {
    name: s,
    color: Ai(r)
  };
}
function Ai(i) {
  if (i)
    return fe(i) ? q(i) : i;
}
function Si(i) {
  const e = new Map(i.map((s) => [String(s.id), s])), t = /* @__PURE__ */ new Map();
  return i.forEach((s) => {
    t.set(String(s.id), dt(s, e, t, /* @__PURE__ */ new Set()));
  }), t;
}
function Ei(i, e) {
  return e.get(String(i.id)) ?? (ge(i) ? 1 : 0);
}
function ge(i) {
  const e = i, t = e.parent_id ?? e.parentId ?? (typeof e.parent == "object" ? e.parent.id : e.parent);
  return t == null || t === "" ? void 0 : String(t);
}
function dt(i, e, t, s) {
  const r = String(i.id), n = ge(i);
  if (!n) return 0;
  if (t.has(r)) return t.get(r) ?? 0;
  if (s.has(r)) return 1;
  s.add(r);
  const o = e.get(n), a = o ? Math.min(dt(o, e, t, s) + 1, 6) : 1;
  return t.set(r, a), a;
}
const g = {
  ITEM_ADD: "item_add",
  ITEM_UPDATE: "item_update",
  ITEM_DELETE: "item_delete",
  ITEM_COMPLETE: "item_close",
  ITEM_UNCOMPLETE: "item_uncomplete",
  ITEM_MOVE: "item_move"
}, Ci = /* @__PURE__ */ new Set([
  "content",
  "description",
  "due",
  "priority",
  "collapsed",
  "assigned_by_uid",
  "responsible_uid",
  "day_order"
]);
function Mi(i, e, t, s = "actions_close", r = {}) {
  var we;
  const n = Pi(e[s]), o = B(n, "label"), a = ki(n), l = B(n, "allow"), c = B(n, "add").map((ee) => _e(ee, i, t, "")), u = Di(n), d = W(n, "toast"), m = W(n, "confirm"), f = W(n, "service"), _ = W(n, "prompt_texts"), D = B(n, "emphasis"), T = ((we = t == null ? void 0 : t.user) == null ? void 0 : we.name) ?? "";
  if (l.length && !l.includes(T))
    return { commands: [], adds: [], followUpActions: [], toast: d, confirm: m };
  const ye = ji(i, s, n, a, _, r.prompt), y = Ii(n, s, i), $e = Ni(s, i, ye);
  if (!n.length && $e && y.push($e), a.length || o.length) {
    const ee = xi(i.labels ?? [], o, T), ut = {
      id: i.id,
      labels: ee,
      ...Oi(a, i, t, ye)
    };
    return y.unshift(k(g.ITEM_UPDATE, ut)), We(y, n, i, e, t), {
      commands: y,
      adds: c,
      followUpActions: qe(u, i, t),
      optimisticTask: Ve(i, y),
      toast: d,
      confirm: m,
      service: f,
      emphasis: D
    };
  }
  return We(y, n, i, e, t), {
    commands: y,
    adds: c,
    followUpActions: qe(u, i, t),
    optimisticTask: Ve(i, y),
    toast: d,
    confirm: m,
    service: f,
    emphasis: D
  };
}
function xi(i, e, t) {
  let s = [...i];
  return e.includes("!*") && (s = []), e.includes("!_") && (s = s.filter((r) => !r.startsWith("_"))), e.includes("!!") && (s = s.filter((r) => r.startsWith("_"))), e.forEach((r) => {
    if (["!*", "!_", "!!"].includes(r)) return;
    const n = Z(r, { "%user%": t });
    if (r.startsWith("!")) {
      s = s.filter((o) => o !== n.slice(1));
      return;
    }
    if (r.startsWith(":")) {
      const o = n.slice(1);
      s = s.includes(o) ? s.filter((a) => a !== o) : [...s, o];
      return;
    }
    s.includes(n) || (s = [...s, n]);
  }), [...new Set(s)];
}
function Pi(i) {
  return i ? Array.isArray(i) ? i : [i] : [];
}
function B(i, e) {
  const t = i.find((r) => typeof r == "object" && r[e] !== void 0);
  if (typeof t != "object") return [];
  const s = t[e];
  return Array.isArray(s) ? s.map(String) : typeof s == "string" ? [s] : [];
}
function W(i, e) {
  const t = i.find((r) => typeof r == "object" && r[e] !== void 0);
  if (typeof t != "object") return;
  const s = t[e];
  return Array.isArray(s) ? s.join(" ") : s;
}
function ki(i) {
  const e = i.find((t) => typeof t == "object" && Array.isArray(t.update));
  return typeof e == "object" && Array.isArray(e.update) ? e.update : [];
}
function Di(i) {
  const e = i.find((t) => typeof t == "object" && Array.isArray(t.match));
  return typeof e == "object" && Array.isArray(e.match) ? e.match : [];
}
function Ii(i, e, t) {
  const s = [], r = Be(e);
  return !i.length && r && s.push(k(r, { id: t.id })), i.forEach((n) => {
    if (typeof n != "string") return;
    const o = Be(`actions_${n}`);
    o && s.push(k(o, { id: t.id }));
  }), s;
}
function Be(i) {
  if (i === "actions_close") return g.ITEM_COMPLETE;
  if (i === "actions_delete") return g.ITEM_DELETE;
  if (i === "actions_uncomplete") return g.ITEM_UNCOMPLETE;
}
function Ni(i, e, t) {
  if (i === "actions_content")
    return k(g.ITEM_UPDATE, { id: e.id, content: t });
  if (i === "actions_description")
    return k(g.ITEM_UPDATE, { id: e.id, description: t });
}
function Oi(i, e, t, s) {
  return i.reduce((r, n) => (Object.entries(n).forEach(([o, a]) => {
    Ci.has(o) && (r[o] = Li(a, e, t, s, e[o]));
  }), r), {});
}
function Li(i, e, t, s, r = "") {
  return typeof i != "string" ? i : _e(i, e, t, s, r);
}
function _e(i, e, t, s, r = "") {
  var o;
  const n = Object.entries(e).reduce((a, [l, c]) => ((typeof c == "string" || typeof c == "number" || typeof c == "boolean") && (a[`%${l}%`] = String(c)), a), {
    "%user%": ((o = t == null ? void 0 : t.user) == null ? void 0 : o.name) ?? "",
    "%input%": s,
    "%line%": `
`,
    "%str_labels%": JSON.stringify(e.labels ?? []),
    "%date%": (/* @__PURE__ */ new Date()).toISOString()
  });
  return Z(i, n, String(r ?? ""), s);
}
function ji(i, e, t, s, r, n) {
  if (!(!!r || JSON.stringify(s).includes("%input%") || !t.length && ["actions_content", "actions_description"].includes(e)) || !n) return "";
  const a = e.replace(/^actions_/, "");
  let l = `Please enter a new value for ${a}:`, c = String(i[a] ?? "");
  if (r) {
    const [u, d = ""] = r.split("|");
    l = u, c = d;
  }
  return c = _e(c, i, void 0, ""), n(l, c) ?? "";
}
function We(i, e, t, s, r) {
  if (!e.includes("move")) return;
  const n = zi(t, Ui(s, r));
  n && i.push(k(g.ITEM_MOVE, n));
}
function Ui(i, e) {
  var t;
  return me((t = e == null ? void 0 : e.states) == null ? void 0 : t[i.entity]);
}
function zi(i, e) {
  const t = Hi(i, e);
  if (t)
    return {
      id: i.id,
      [t === i.project_id ? "project_id" : "section_id"]: t
    };
}
function Hi(i, e) {
  const t = [...e].sort((n, o) => Je(n) - Je(o));
  if (!t.length) return i.project_id;
  const s = t.findIndex((n) => String(n.id) === String(i.section_id ?? "")), r = s < 0 ? t[0] : t[s + 1];
  return (r == null ? void 0 : r.id) ?? i.project_id;
}
function Je(i) {
  return (i.section_order ?? i.order ?? Number(i.id)) || 0;
}
function qe(i, e, t) {
  return i.flatMap((s) => {
    if (!Array.isArray(s)) return [];
    const [r, n, o, a] = s;
    if (typeof r != "string") return [];
    const c = (r.includes(".") ? Ri(r, t) === n : Fi(e[r], n)) ? o : a;
    return typeof c == "string" && c.length ? [Bi(c)] : [];
  });
}
function Ri(i, e) {
  var n, o;
  const [t, s] = i.split("#"), r = (n = e == null ? void 0 : e.states) == null ? void 0 : n[t];
  return s ? (o = r == null ? void 0 : r.attributes) == null ? void 0 : o[s] : r == null ? void 0 : r.state;
}
function Fi(i, e) {
  return Array.isArray(i) ? i.includes(e) : i === e;
}
function Bi(i) {
  return i.startsWith("actions_") ? i.slice(8) : i;
}
function k(i, e) {
  return {
    type: i,
    uuid: zt(),
    args: e
  };
}
function Ve(i, e) {
  return e.reduce((t, s) => {
    const r = t ?? i;
    if (s.type === g.ITEM_UPDATE)
      return {
        ...r,
        ...s.args,
        id: i.id
      };
    if (s.type === g.ITEM_MOVE) {
      const n = { ...r };
      return typeof s.args.section_id == "string" && (n.section_id = s.args.section_id), typeof s.args.project_id == "string" && (n.project_id = s.args.project_id, n.section_id = null), n;
    }
    return t;
  }, void 0);
}
async function Ze(i, e, t) {
  !i || !e.length || (await i.callService("rest_command", "todoist", {
    url: "sync",
    payload: `commands=${JSON.stringify(e)}`
  }), t && await i.callService("homeassistant", "update_entity", {
    entity_id: t
  }));
}
async function Wi(i, e) {
  !i || !e.length || await Promise.all(e.map(
    (t) => i.callService("rest_command", "todoist", {
      url: "quick/add",
      payload: `text=${t}`
    })
  ));
}
async function Ji(i, e, t) {
  !i || !e || (await i.callService("rest_command", "todoist", {
    url: "tasks/quick",
    payload: `text=${e}`
  }), t && await i.callService("homeassistant", "update_entity", {
    entity_id: t
  }));
}
async function qi(i, e, t) {
  if (!i || !e) return;
  const s = e.includes("script.");
  await i.callService(
    s ? "homeassistant" : "automation",
    s ? "turn_on" : "trigger",
    { entity_id: e }
  ), t && await i.callService("homeassistant", "update_entity", {
    entity_id: t
  });
}
const K = class K extends x {
  constructor() {
    super(...arguments), this.itemsJustCompleted = [], this.pendingTaskIds = /* @__PURE__ */ new Set(), this.emphasizedTaskIds = /* @__PURE__ */ new Set(), this.clickCount = 0, this.longPressMs = 1500, this.clickDelayMs = 500;
  }
  setConfig(e) {
    if (!(e != null && e.entity)) throw new Error("PowerTodoistCard: entity is required");
    this.config = {
      show_header: !0,
      show_completed: 5,
      show_item_add: !0,
      show_item_description: !0,
      show_item_labels: !0,
      ...e
    };
  }
  getCardSize() {
    var e;
    return !this.hass || !((e = this.config) != null && e.entity) ? 1 : Ne(this.hass.states[this.config.entity]).length || 1;
  }
  static getConfigElement() {
    return document.createElement("powertodoist-card-editor");
  }
  static getStubConfig() {
    return { entity: "" };
  }
  render() {
    let e;
    try {
      e = this.computeContext();
    } catch (s) {
      const r = s instanceof Error ? s.message : String(s);
      return h`<ha-card><div class="card error">${r}</div></ha-card>`;
    }
    const t = this.hasTodoistSensorData(e.entity);
    return h`
      <ha-card
        class=${this.getCardClass(e)}
        style=${this.getCardStyle(e)}
      >
        ${e.config.style ? h`<style>${e.config.style}</style>` : p}
        <div
          class="card"
        >
          ${t ? this.renderHeader(e) : p}
          ${t && e.config.markdown_top_content ? h`<div class="top-markdown">${Ie(this.renderMarkdownText(e.config.markdown_top_content))}</div>` : p}

          <div class="list">
            ${t ? e.tasks.length ? e.tasks.map((s) => this.renderTask(s, e)) : h`<div class="empty">${this.getEmptyMessage(e)}</div>` : h`<div class="empty">${this.getEmptyMessage(e)}</div>`}
          </div>

          ${t ? this.renderCompletedTasks(e) : p}
          ${t ? this.renderAddTaskInput(e) : p}

          ${t && e.config.markdown_bottom_content ? h`<div class="bottom-markdown">${Ie(this.renderMarkdownText(e.config.markdown_bottom_content))}</div>` : p}
        </div>
        ${this.toast ? h`<div class=${`toast ${this.toast.tone}`}>${this.toast.message}</div>` : p}
      </ha-card>
    `;
  }
  computeContext() {
    var d, m;
    if (!this.config) throw new Error("PowerTodoistCard: config is not set");
    const e = Ht(this.config, this.hass), t = (m = (d = this.hass) == null ? void 0 : d.states) == null ? void 0 : m[e.entity];
    if (!t)
      return {
        config: e,
        title: this.getFallbackTitle(e),
        tasks: [],
        taskDepths: /* @__PURE__ */ new Map(),
        cardLabels: [],
        labelColors: /* @__PURE__ */ new Map(),
        rawLabelColors: []
      };
    const s = gi(e, t), r = this.getCurrentTasks(t), n = Bt(r, e), o = _i(n, e, s), a = bi(e, o), l = hi(o, e), c = Si(o), u = this.getRawLabelColors();
    return {
      config: e,
      entity: t,
      title: this.getDisplayTitle(e, t, s, this.config),
      tasks: l,
      taskDepths: c,
      cardLabels: a,
      labelColors: this.getLabelColorMap(u),
      rawLabelColors: u
    };
  }
  renderHeader(e) {
    return e.config.show_header === !1 ? p : h`
      <h1 class="title">
        <span>${e.title}</span>
        ${this.renderCardLabels(e)}
      </h1>
    `;
  }
  renderCardLabels(e) {
    const t = e.config.show_card_labels === !1 || e.cardLabels.length !== 1 ? [] : e.cardLabels;
    return t.length ? h`
      <span class="title-labels">
        ${t.map((s) => this.renderStaticLabel(s, e))}
      </span>
    ` : p;
  }
  renderTask(e, t) {
    const s = this.getVisibleLabels(e, t);
    return h`
      <div class=${this.getTaskClass(e, s)} style=${this.getTaskStyle(e, t)}>
        ${this.renderCloseControl(e, t)}
        <div class="content">
          <span
            class="name action-target"
            @pointerdown=${() => this.startPress(e, t, "longpress_content")}
            @pointerup=${() => this.endPress(e, t, "content", "dbl_content")}
            @pointercancel=${() => this.cancelPress()}
            @pointerleave=${() => this.cancelPress()}
          >${e.content}</span>
          ${t.config.show_item_description === !1 || !e.description ? p : h`<span
                class="description action-target"
                @pointerdown=${() => this.startPress(e, t, "longpress_description")}
                @pointerup=${() => this.endPress(e, t, "description", "dbl_description")}
                @pointercancel=${() => this.cancelPress()}
                @pointerleave=${() => this.cancelPress()}
              >${e.description}</span>`}
          ${!this.shouldRenderLabels(t) || !s.length ? p : h`<div class="labels">${s.map((r) => this.renderLabel(r, e, t))}</div>`}
        </div>
        ${t.config.show_item_delete === !1 ? p : h`
              <button
                class="icon-button delete-button"
                type="button"
                title="Delete task"
                @pointerdown=${() => this.startPress(e, t, "longpress_delete")}
                @pointerup=${() => this.endPress(e, t, "delete", "dbl_delete")}
                @pointercancel=${() => this.cancelPress()}
                @pointerleave=${() => this.cancelPress()}
              >
                ${this.renderConfiguredIcon(t, 3)}
              </button>
            `}
      </div>
    `;
  }
  renderCompletedTasks(e) {
    return !e.entity || !e.config.show_completed || !this.itemsJustCompleted.length ? p : h`
      <div class="completed-list">
        ${this.itemsJustCompleted.map((t) => this.renderCompletedTask(t, e))}
      </div>
    `;
  }
  renderCompletedTask(e, t) {
    const s = this.pendingTaskIds.has(e.id), r = s ? h`<span class="spinner" aria-label="Saving"></span>` : this.renderConfiguredIcon(t, 2), n = s ? h`<span class="spinner" aria-label="Saving"></span>` : this.renderConfiguredIcon(t, 3);
    return h`
      <div class=${this.getTaskClass(e, [], "completed-task")} style=${this.getTaskStyle(e, t)}>
        ${t.config.show_item_close === !1 ? h`<span class="icon-button">${this.renderConfiguredIcon(t, 0)}</span>` : h`
              <button
                class="icon-button"
                type="button"
                title="Uncomplete task"
                @pointerdown=${() => this.startPress(e, t, "longpress_uncomplete")}
                @pointerup=${() => this.endPress(e, t, "uncomplete", "dbl_uncomplete")}
                @pointercancel=${() => this.cancelPress()}
                @pointerleave=${() => this.cancelPress()}
              >
                ${r}
              </button>
            `}
        <div class="content">
          <span class="name">${e.content}</span>
          ${t.config.show_item_description === !1 || !e.description ? p : h`<span class="description">${e.description}</span>`}
        </div>
        ${t.config.show_item_delete === !1 ? p : h`
              <button
                class="icon-button delete-button"
                type="button"
                title="Remove from completed list"
                @pointerdown=${() => this.startPress(e, t, "longpress_unlist_completed")}
                @pointerup=${() => this.endPress(e, t, "unlist_completed", "dbl_unlist_completed")}
                @pointercancel=${() => this.cancelPress()}
                @pointerleave=${() => this.cancelPress()}
              >
                ${n}
              </button>
            `}
      </div>
    `;
  }
  renderAddTaskInput(e) {
    return !e.entity || !this.hasTodoistSensorData(e.entity) || e.config.show_item_add === !1 ? p : h`
      <input
        id="powertodoist-card-item-add"
        class="add-task-input"
        type="text"
        placeholder="New item..."
        enterkeyhint="enter"
        @keyup=${(t) => this.handleAddTaskKeyup(t, e)}
      />
    `;
  }
  renderCloseControl(e, t) {
    const s = this.pendingTaskIds.has(e.id) ? h`<span class="spinner" aria-label="Saving"></span>` : this.renderTaskIcon(e, t);
    return t.config.show_item_close === !1 ? h`<span class="icon-button">${s}</span>` : h`
      <button
        class="icon-button"
        type="button"
        title="Toggle task"
        @pointerdown=${() => this.startPress(e, t, "longpress_close")}
        @pointerup=${() => this.endPress(e, t, "close", "dbl_close")}
        @pointercancel=${() => this.cancelPress()}
        @pointerleave=${() => this.cancelPress()}
      >
        ${s}
      </button>
    `;
  }
  renderLabel(e, t, s) {
    var c;
    const r = e.endsWith("_outline"), n = ti(e), o = e.replace(/_outline$/, ""), a = ((c = o.split(":")[0]) == null ? void 0 : c.trim()) ?? o, l = n ? "var(--primary-background-color)" : s.labelColors.get(o) ?? s.labelColors.get(a) ?? q("green");
    return h`
      <span
        class=${[
      r ? "label" : "label label-fill",
      n ? "date-label" : ""
    ].filter(Boolean).join(" ")}
        style=${`--pt-label-color: ${l}`}
        @pointerdown=${() => this.startPress(t, s, "longpress_label")}
        @pointerup=${() => this.endPress(t, s, "label", "dbl_label")}
        @pointercancel=${() => this.cancelPress()}
        @pointerleave=${() => this.cancelPress()}
      >
        ${o}
      </span>
    `;
  }
  renderStaticLabel(e, t) {
    const s = e.endsWith("_outline"), r = e.replace(/_outline$/, ""), n = t.labelColors.get(e) ?? t.labelColors.get(r) ?? q("green");
    return h`
      <span
        class=${s ? "label" : "label label-fill"}
        style=${`--pt-label-color: ${n}`}
      >
        ${r}
      </span>
    `;
  }
  getVisibleLabels(e, t) {
    return mi(e, t.config, t.cardLabels, t.rawLabelColors);
  }
  shouldRenderLabels(e) {
    var t;
    return e.config.show_item_labels !== !1 || !!((t = e.config.extra_labels) != null && t.length);
  }
  renderTaskIcon(e, t) {
    const s = vi(e, t.config);
    return this.renderIcon(s);
  }
  renderConfiguredIcon(e, t) {
    return this.renderIcon(Ti(e.config, t));
  }
  renderIcon(e) {
    return h`
      <ha-icon
        class="icon"
        icon=${`mdi:${e.name}`}
        style=${e.color ? `color: ${e.color}` : ""}
      ></ha-icon>
    `;
  }
  getTaskClass(e, t = [], s = "") {
    return [
      "task",
      s,
      ge(e) ? "subtask" : "",
      e.description || t.length ? "has-detail" : "",
      e.statusFromLabelCriteria ? "done" : "",
      this.pendingTaskIds.has(e.id) ? "pending" : "",
      this.emphasizedTaskIds.has(e.id) ? "emphasis" : ""
    ].filter(Boolean).join(" ");
  }
  getTaskStyle(e, t) {
    return `--pt-task-depth: ${Ei(e, t.taskDepths)};`;
  }
  getCardClass(e) {
    return $i(e.config);
  }
  getCardStyle(e) {
    return wi(e.config);
  }
  getEmptyMessage(e) {
    return this.hasTodoistSensorData(e.entity) ? "No uncompleted tasks!" : "Powertodoist sensors don't have any data yet. Please wait a few seconds and refresh. [todoist sensor]";
  }
  hasTodoistSensorData(e) {
    const t = (e == null ? void 0 : e.attributes) ?? {};
    return [
      "project",
      "tasks",
      "items",
      "sections",
      "project_sections",
      "results",
      "result",
      "data"
    ].some((s) => s in t);
  }
  getRawLabelColors() {
    try {
      return Lt(this.hass).filter((e) => {
        if (!e || typeof e != "object") return !1;
        const t = e;
        return typeof t.name == "string" && typeof t.color == "string";
      });
    } catch {
      return [];
    }
  }
  getLabelColorMap(e) {
    const t = /* @__PURE__ */ new Map();
    return e.forEach((s) => {
      const r = fe(s.color) ? q(s.color) : void 0;
      r && t.set(s.name, r);
    }), t;
  }
  renderMarkdownText(e) {
    return ni(e, this.hass);
  }
  getDisplayTitle(e, t, s, r) {
    const n = yi(e, t, s);
    return e.show_relative_day ? Qt(n, this.hass, {
      entityId: e.relative_day_entity,
      sourceToken: r.filter_section
    }) : n;
  }
  getFallbackTitle(e) {
    return e.name || e.friendly_name || e.filter_section || "ToDoist";
  }
  getCurrentTasks(e) {
    return this.optimisticTasks ?? Ne(e);
  }
  startPress(e, t, s) {
    this.longPressTimer = window.setTimeout(() => {
      this.longPressTimer = void 0, this.clickCount = 0, this.clickTimer && window.clearTimeout(this.clickTimer), this.clickTimer = void 0, this.executeTaskAction(e, t, s);
    }, this.longPressMs);
  }
  endPress(e, t, s, r = "") {
    if (this.longPressTimer) {
      if (window.clearTimeout(this.longPressTimer), this.longPressTimer = void 0, this.clickCount += 1, this.clickCount === 1) {
        if (!r) {
          this.clickCount = 0, this.executeTaskAction(e, t, s);
          return;
        }
        this.clickTimer = window.setTimeout(() => {
          this.clickCount = 0, this.clickTimer = void 0, this.executeTaskAction(e, t, s);
        }, this.clickDelayMs);
        return;
      }
      this.clickCount === 2 && (this.clickTimer && window.clearTimeout(this.clickTimer), this.clickTimer = void 0, this.clickCount = 0, this.executeTaskAction(e, t, r));
    }
  }
  cancelPress() {
    this.longPressTimer && (window.clearTimeout(this.longPressTimer), this.longPressTimer = void 0);
  }
  async executeTaskAction(e, t, s, r = !1) {
    var c, u;
    if (!t.entity) return;
    if (s.endsWith("unlist_completed")) {
      if (!r && this.pendingTaskIds.has(e.id)) return;
      const d = [...this.itemsJustCompleted];
      this.pendingTaskIds.add(e.id), this.removeCompletedTask(e), this.requestUpdate();
      try {
        await ((c = this.hass) == null ? void 0 : c.callService("homeassistant", "update_entity", {
          entity_id: t.config.entity
        }));
      } catch (m) {
        this.itemsJustCompleted = d, this.showToast("Could not save. Reverted.", "error"), console.warn("[PowerTodoist] completed-list action failed, reverted optimistic update", m);
      } finally {
        this.pendingTaskIds.delete(e.id), this.requestUpdate();
      }
      return;
    }
    const n = this.getCurrentTasks(t.entity), o = [...this.itemsJustCompleted], a = Mi(e, t.config, this.hass, `actions_${s}`, {
      prompt: (d, m) => window.prompt(d, m)
    });
    if ((a.commands.length || a.adds.length || a.followUpActions.length || a.service || (u = a.emphasis) != null && u.length) && !(!r && this.pendingTaskIds.has(e.id)) && !(a.confirm && !window.confirm(a.confirm))) {
      this.pendingTaskIds.add(e.id), this.applyEmphasis(e, a.emphasis), this.applyOptimisticAction(e, n, a, t.config), this.requestUpdate();
      try {
        a.commands.length && await Ze(this.hass, a.commands, t.config.entity), await Wi(this.hass, a.adds), await qi(this.hass, a.service, t.config.entity);
        const d = this.getOptimisticTaskById(e.id) ?? a.optimisticTask ?? e;
        await Promise.all(a.followUpActions.map(
          (m) => this.executeTaskAction(d, t, m, !0)
        )), (a.toast || a.commands.length || a.adds.length || a.service) && this.showToast(a.toast || "Saved", "success");
      } catch (d) {
        this.optimisticTasks = n, this.itemsJustCompleted = o, this.showToast("Could not save. Reverted.", "error"), console.warn("[PowerTodoist] Todoist action failed, reverted optimistic update", d);
      } finally {
        this.pendingTaskIds.delete(e.id), this.requestUpdate();
      }
    }
  }
  async handleAddTaskKeyup(e, t) {
    if (e.key !== "Enter" && e.which !== 13 || !t.entity) return;
    const s = e.currentTarget, r = (s == null ? void 0 : s.value) ?? "";
    if (!(r.length <= 1))
      try {
        t.config.use_quick_add ? await Ji(
          this.hass,
          this.buildQuickAddText(r, t, t.entity),
          t.config.entity
        ) : await Ze(
          this.hass,
          [this.buildItemAddCommand(r, t.entity)],
          t.config.entity
        ), s && (s.value = ""), this.showToast("Saved", "success");
      } catch (n) {
        this.showToast("Could not save.", "error"), console.warn("[PowerTodoist] Todoist add task failed", n);
      }
  }
  buildItemAddCommand(e, t) {
    const s = this.getUUID();
    return {
      type: g.ITEM_ADD,
      temp_id: s,
      uuid: s,
      args: {
        project_id: t.state,
        content: e
      }
    };
  }
  buildQuickAddText(e, t, s) {
    let r = e;
    const n = t.config.filter_section, o = this.getProjectName(s);
    return n && !r.includes(" /") && (r += ` /${this.escapeQuickAddToken(n)}`), o && !r.includes(" #") && (r += ` #${this.escapeQuickAddToken(o)}`), r;
  }
  getProjectName(e) {
    var s;
    const t = (s = e.attributes) == null ? void 0 : s.project;
    return t && typeof t == "object" && "name" in t ? String(t.name ?? "") : void 0;
  }
  escapeQuickAddToken(e) {
    return e.replaceAll(" ", "\\ ");
  }
  getUUID() {
    const e = /* @__PURE__ */ new Date();
    return `${Math.floor(Math.random() * 99 + 1)}-${Number(e)}-${e.getMilliseconds()}`;
  }
  applyEmphasis(e, t) {
    t != null && t.length && (this.emphasizedTaskIds.add(e.id), this.requestUpdate(), window.setTimeout(() => {
      this.emphasizedTaskIds.delete(e.id), this.requestUpdate();
    }, 3e3));
  }
  applyCommandSideEffects(e, t, s, r) {
    const n = s.map((o) => o.type);
    return n.includes(g.ITEM_COMPLETE) ? (this.rememberCompletedTask(e, r.show_completed ?? 5), t.filter((o) => o.id !== e.id)) : n.includes(g.ITEM_UNCOMPLETE) ? (this.removeCompletedTask(e), this.upsertTask(t, {
      ...e,
      checked: !1,
      completed_at: null
    })) : n.includes(g.ITEM_DELETE) ? (this.removeCompletedTask(e), t.filter((o) => o.id !== e.id)) : t;
  }
  applyOptimisticAction(e, t, s, r) {
    let n = t;
    const o = s.optimisticTask ?? e;
    s.optimisticTask && (n = this.upsertTask(n, s.optimisticTask)), s.commands.length && (n = this.applyCommandSideEffects(o, n, s.commands, r)), n !== t && (this.optimisticTasks = n);
  }
  getOptimisticTaskById(e) {
    var t;
    return (t = this.optimisticTasks) == null ? void 0 : t.find((s) => s.id === e);
  }
  rememberCompletedTask(e, t) {
    if (t <= 0) return;
    const s = this.itemsJustCompleted.filter((r) => r.id !== e.id);
    this.itemsJustCompleted = [...s, e].slice(-t);
  }
  removeCompletedTask(e) {
    this.itemsJustCompleted = this.itemsJustCompleted.filter((t) => t.id !== e.id);
  }
  upsertTask(e, t) {
    return e.some((s) => s.id === t.id) ? e.map((s) => s.id === t.id ? t : s) : [...e, t];
  }
  showToast(e, t) {
    this.toastTimeout && window.clearTimeout(this.toastTimeout), this.toast = { message: e, tone: t }, this.requestUpdate(), this.toastTimeout = window.setTimeout(() => {
      this.toast = void 0, this.requestUpdate();
    }, t === "error" ? 4500 : 2200);
  }
};
K.properties = {
  hass: { attribute: !1 },
  config: { state: !0 }
}, K.styles = ht`
    ha-card {
      overflow: hidden;
    }

    ha-card.left-accent {
      border-left: 6px solid var(--pt-accent-color);
      padding-left: 0;
      margin-left: 0;
    }

    .card {
      padding: 22px 28px 18px;
    }

    .top-markdown,
    .bottom-markdown {
      margin: -6px 0 16px;
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 1.35;
    }

    .bottom-markdown {
      margin: 18px 0 0;
    }

    .title {
      margin: 0 0 22px;
      font-size: var(--pt-title-font-size, 24px);
      font-weight: 500;
      line-height: 1.2;
      color: var(--primary-text-color);
    }

    .title-labels {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-left: 8px;
      vertical-align: middle;
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--pt-row-gap, 12px);
    }

    .completed-list {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid var(--divider-color);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .add-task-input {
      width: 100%;
      box-sizing: border-box;
      margin-top: 18px;
      padding: 10px 0;
      border: 0;
      border-bottom: 1px solid var(--divider-color);
      outline: 0;
      background: transparent;
      color: var(--primary-text-color);
      font: inherit;
      font-size: var(--pt-item-font-size, 16px);
    }

    .add-task-input::placeholder {
      color: var(--secondary-text-color);
      opacity: 0.8;
    }

    .add-task-input:focus {
      border-bottom-color: var(--primary-color, #149514);
    }

    .task {
      display: grid;
      grid-template-columns: 30px minmax(0, 1fr) auto;
      align-items: start;
      column-gap: 12px;
      min-height: calc(var(--pt-item-line-size, 40px) + var(--pt-line-padding-top, 0px) + var(--pt-line-padding-bottom, 0px));
      padding-top: var(--pt-line-padding-top, 0px);
      padding-bottom: var(--pt-line-padding-bottom, 0px);
      margin-left: calc(var(--pt-subtask-indent, 28px) * var(--pt-task-depth, 0));
      box-sizing: border-box;
    }

    .task.has-detail {
      padding-bottom: max(var(--pt-line-padding-bottom, 0px), 4px);
    }

    .task.done .icon {
      color: var(--pt-complete-icon-color, #149514);
    }

    .icon-button {
      width: var(--pt-icon-size, 24px);
      height: var(--pt-icon-size, 24px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 1px;
      cursor: pointer;
      border: 0;
      background: transparent;
      color: var(--pt-incomplete-icon-color, #149514);
      margin: 0;
      padding-left: 0;
      padding-right: 0;
    }

    .icon {
      width: var(--pt-icon-size, 24px);
      height: var(--pt-icon-size, 24px);
    }

    .task.pending {
      opacity: 0.68;
    }

    .task.pending .icon-button {
      color: var(--secondary-text-color);
    }

    .completed-task {
      opacity: 0.64;
    }

    .completed-task .name {
      text-decoration: line-through;
    }

    .completed-task .icon-button {
      color: var(--pt-uncomplete-icon-color, var(--secondary-text-color));
    }

    .task.emphasis {
      animation: pt-emphasis 0.65s ease-in-out 0s 2;
    }

    @keyframes pt-emphasis {
      50% {
        background: color-mix(in srgb, var(--primary-color, #149514) 14%, transparent);
      }
    }

    .spinner {
      width: calc(var(--pt-icon-size, 24px) - 6px);
      height: calc(var(--pt-icon-size, 24px) - 6px);
      border: 2px solid color-mix(in srgb, currentColor 25%, transparent);
      border-top-color: currentColor;
      border-radius: 50%;
      animation: pt-spin 0.75s linear infinite;
    }

    @keyframes pt-spin {
      to {
        transform: rotate(360deg);
      }
    }

    .content {
      min-width: 0;
    }

    .action-target {
      cursor: pointer;
    }

    .name {
      display: block;
      font-size: var(--pt-item-font-size, 16px);
      line-height: 1.25;
      color: var(--primary-text-color);
      white-space: normal;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .description {
      display: inline-block;
      margin-top: 3px;
      font-size: 0.86em;
      line-height: 1.25;
      color: var(--secondary-text-color);
      white-space: normal;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .labels {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 5px;
    }

    .label {
      display: inline-flex;
      align-items: center;
      min-height: 16px;
      padding: 1px 5px;
      border: 1px solid currentColor;
      border-radius: 3px;
      font-size: 11px;
      line-height: 1.2;
      color: var(--pt-label-color, #149514);
      background: transparent;
      cursor: pointer;
    }

    .delete-button {
      color: var(--pt-delete-icon-color, #db4437);
    }

    .label-fill {
      color: white;
      background: var(--pt-label-color, #149514);
      border-color: var(--pt-label-color, #149514);
    }

    .date-label {
      color: var(--primary-text-color);
    }

    .empty,
    .error {
      color: var(--secondary-text-color);
      font-size: 14px;
      line-height: 1.4;
    }

    .error {
      color: var(--error-color, #db4437);
    }

    .toast {
      position: absolute;
      right: 16px;
      bottom: 14px;
      max-width: calc(100% - 32px);
      padding: 8px 11px;
      border-radius: 6px;
      background: var(--card-background-color, white);
      border: 1px solid var(--divider-color);
      color: var(--primary-text-color);
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgb(0 0 0 / 18%));
      font-size: 13px;
      line-height: 1.25;
      z-index: 1;
    }

    .toast.success {
      border-color: color-mix(in srgb, #149514 55%, var(--divider-color));
    }

    .toast.error {
      border-color: var(--error-color, #db4437);
      color: var(--error-color, #db4437);
    }
  `;
let ce = K;
const Vi = Array.from({ length: 16 }, (i, e) => ({
  value: e,
  label: String(e)
})), Qe = [
  { value: "ascending", label: "Ascending" },
  { value: "descending", label: "Descending" }
], Zi = [
  { name: "entity", label: "Entity (required)", required: !0, selector: { entity: { domain: "sensor" } } },
  { name: "comments_entity", label: "Comments entity", selector: { entity: { domain: "sensor" } } },
  { name: "name", label: "Name", selector: { text: {} } },
  { name: "friendly_name", label: "Friendly name", selector: { text: {} } },
  { name: "show_header", label: "Show header", selector: { boolean: {} } },
  {
    name: "show_completed",
    label: "Completed tasks shown at bottom",
    selector: { select: { options: Vi, mode: "dropdown" } }
  },
  { name: "show_item_add", label: "Show add-task input", selector: { boolean: {} } },
  { name: "use_quick_add", label: "Use Todoist Quick Add", selector: { boolean: {} } },
  { name: "show_item_close", label: "Show complete/uncomplete buttons", selector: { boolean: {} } },
  { name: "show_item_delete", label: "Show delete buttons", selector: { boolean: {} } },
  { name: "show_item_description", label: "Show item descriptions", selector: { boolean: {} } },
  { name: "show_item_labels", label: "Show item labels", selector: { boolean: {} } },
  { name: "show_card_labels", label: "Show card labels", selector: { boolean: {} } },
  { name: "filter_section", label: "Filter section", selector: { text: {} } },
  { name: "filter_section_id", label: "Filter section id", selector: { text: {} } },
  { name: "filter_labels", label: "Filter labels", selector: { object: {} } },
  { name: "filter_show_dates_starting", label: "Date filter start", selector: { text: {} } },
  { name: "filter_show_dates_ending", label: "Date filter end", selector: { text: {} } },
  { name: "filter_show_dates_empty", label: "Show tasks without due date", selector: { boolean: {} } },
  { name: "sort_by_due_date", label: "Sort by due date", selector: { select: { options: Qe } } },
  { name: "sort_by_priority", label: "Sort by priority", selector: { select: { options: Qe } } },
  { name: "show_dates", label: "Show due dates", selector: { boolean: {} } },
  { name: "date_format", label: "Date format", selector: { text: {} } },
  { name: "show_relative_day", label: "Show relative day title", selector: { boolean: {} } },
  { name: "relative_day_entity", label: "Relative day entity", selector: { entity: { domain: "sensor" } } },
  { name: "extra_labels", label: "Extra labels", selector: { object: {} } },
  { name: "status_from_labels", label: "Status from labels", selector: { object: {} } },
  { name: "icons", label: "Icons", selector: { object: {} } },
  { name: "markdown_top_content", label: "Top markdown", selector: { text: { multiline: !0 } } },
  { name: "markdown_bottom_content", label: "Bottom markdown", selector: { text: { multiline: !0 } } },
  { name: "accent", label: "Accent color", selector: { text: {} } },
  { name: "style", label: "Custom CSS", selector: { text: { multiline: !0 } } },
  { name: "line_size", label: "Line size", selector: { number: { min: 16, max: 120, mode: "box" } } },
  { name: "font_size", label: "Font size", selector: { number: { min: 8, max: 48, mode: "box" } } },
  { name: "icon_size", label: "Icon size", selector: { number: { min: 8, max: 64, mode: "box" } } },
  { name: "line_padding_top", label: "Line padding top", selector: { number: { min: 0, max: 48, mode: "box" } } },
  { name: "line_padding_bottom", label: "Line padding bottom", selector: { number: { min: 0, max: 48, mode: "box" } } },
  { name: "actions_close", label: "Actions: close", selector: { object: {} } },
  { name: "actions_dbl_close", label: "Actions: double close", selector: { object: {} } },
  { name: "actions_longpress_close", label: "Actions: longpress close", selector: { object: {} } },
  { name: "actions_content", label: "Actions: content", selector: { object: {} } },
  { name: "actions_description", label: "Actions: description", selector: { object: {} } },
  { name: "actions_label", label: "Actions: label", selector: { object: {} } },
  { name: "actions_delete", label: "Actions: delete", selector: { object: {} } },
  { name: "actions_uncomplete", label: "Actions: uncomplete", selector: { object: {} } }
], Qi = /* @__PURE__ */ new Set(["entity", "show_completed"]), be = class be extends x {
  setConfig(e) {
    this.config = e;
  }
  render() {
    return h`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${Zi}
        @value-changed=${this.handleValueChanged}
      ></ha-form>
    `;
  }
  handleValueChanged(e) {
    this.config = Yi(e.detail.value), this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this.config },
        bubbles: !0,
        composed: !0
      })
    );
  }
};
be.properties = {
  hass: { attribute: !1 },
  config: { state: !0 }
};
let de = be;
function Yi(i) {
  return Object.fromEntries(
    Object.entries(i).filter(
      ([e, t]) => Qi.has(e) || t !== ""
    )
  );
}
const ne = "powertodoist-card", Ye = "powertodoist-card-editor", Ge = "__powerTodoistCardRegistered";
function Gi() {
  customElements.get(Ye) || customElements.define(Ye, de), customElements.get(ne) || customElements.define(ne, ce), window[Ge] || (window.customCards = window.customCards || [], window.customCards.push({
    preview: !0,
    type: ne,
    name: "PowerTodoist Card",
    description: "Todoist card for Home Assistant."
  }), window[Ge] = !0), console.info(
    "%c POWERTODOIST-CARD ",
    "color: white; background: #007d8f; font-weight: 700"
  );
}
Gi();
