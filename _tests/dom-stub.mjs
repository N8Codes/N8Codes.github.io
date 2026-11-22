// The smallest DOM the sheet's views need, so they can be rendered in Node without a browser.
// It records structure only; it is not a browser and doesn't parse markup.
class Node_ {
  constructor() { this.childNodes = []; this.parentNode = null; }
  append(...nodes) { for (const n of nodes) { const node = typeof n === "string" ? new Text_(n) : n; node.parentNode = this; this.childNodes.push(node); } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  remove() { if (this.parentNode) this.parentNode.childNodes = this.parentNode.childNodes.filter((x) => x !== this); }
  get textContent() { return this.childNodes.map((c) => c.textContent).join(""); }
  set textContent(v) { this.childNodes = [new Text_(String(v))]; }
}
class Text_ extends Node_ { constructor(t) { super(); this.data = t; } get textContent() { return this.data; } }
class Element_ extends Node_ {
  constructor(tag) { super(); this.tagName = tag.toUpperCase(); this.attributes = {}; this.dataset = {}; this.listeners = {}; this.style = {}; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  addEventListener(ev, fn) { (this.listeners[ev] ||= []).push(fn); }
  focus() {}
  click() {}
}
globalThis.Node = Node_;
globalThis.document = {
  createElement: (tag) => new Element_(tag),
  createTextNode: (t) => new Text_(t),
  getElementById: () => null,
  body: new Element_("body"),
};
