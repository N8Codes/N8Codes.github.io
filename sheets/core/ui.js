// DOM helpers shared by every system. Values reach the page only as text (textContent / value),
// never as markup, so a character file can't inject anything into the page.

/**
 * el("p", { className: "cite", id: "x" }, "text", childNode, …)
 * attrs: className, id, htmlFor, type, value, checked, disabled, hidden, name, min, max, step,
 *        on: { click: fn, change: fn }, aria: { label: "…" }, data: { key: "…" }, any other attribute as a string.
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "on") for (const [ev, fn] of Object.entries(value)) node.addEventListener(ev, fn);
    else if (key === "aria") for (const [k, v] of Object.entries(value)) { if (v !== undefined && v !== null) node.setAttribute(`aria-${k}`, String(v)); }
    else if (key === "data") for (const [k, v] of Object.entries(value)) node.dataset[k] = String(v);
    else if (["className", "htmlFor", "value", "checked", "disabled", "hidden", "type", "id", "name", "selected", "title"].includes(key)) node[key] = value;
    else node.setAttribute(key, value === true ? "" : String(value));
  }
  append(node, children);
  return node;
}

function append(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

/** A stable id for a field key ("abilities.str" → "f-abilities-str"). */
export const fieldId = (key) => "f-" + key.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
export const msgId = (key) => fieldId(key) + "-msg";

/** "+3" / "−1" with a real minus sign. */
export const signed = (n) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);

/** Card with the ornamented header used across the sheet. */
export function card(title, ...children) {
  return el("section", { className: "card" }, el("h2", {}, title), ...children);
}

/**
 * Message region for a field: shows rule problems (red, amber in free edit) and refusals.
 * It's always present so aria-describedby never points at nothing.
 */
export function fieldMessage(ctx, key) {
  const messages = ctx.messagesFor(key); // [{ text, kind: "error" | "refused" | "todo" }]
  return el("div", { id: msgId(key), className: "field-msgs", aria: { live: "polite" } },
    messages.map((m) => el("p", { className: m.kind === "todo" ? "todo" : "msg" }, m.text)));
}

/** Common attributes for a control tied to a field key. */
export function fieldAttrs(ctx, key, extra = {}) {
  const invalid = ctx.messagesFor(key).some((m) => m.kind !== "todo");
  return { id: fieldId(key), aria: { describedby: msgId(key), invalid: invalid ? "true" : undefined, ...(extra.aria || {}) },
    className: [extra.className, invalid ? "invalid" : ""].filter(Boolean).join(" ") || undefined, ...omit(extra, ["aria", "className"]) };
}

const omit = (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

/** <select> from [{ value, label }], with an optional empty first option. */
export function select(attrs, options, current, placeholder) {
  const s = el("select", attrs);
  if (placeholder !== undefined) s.append(el("option", { value: "" }, placeholder));
  for (const o of options) s.append(el("option", { value: o.value, selected: o.value === current, disabled: o.disabled }, o.label));
  s.value = current ?? "";
  return s;
}

/** Labelled control stacked in a cell: label, control, messages. */
export function labelled(ctx, key, labelText, control) {
  return el("div", { className: "cell" }, el("label", { htmlFor: fieldId(key) }, labelText), control, fieldMessage(ctx, key));
}
