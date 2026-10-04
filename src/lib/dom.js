/** Tiny DOM helpers so section code stays short and readable (no framework). */

/**
 * Create an element: h("div", { class: "card" }, "text", childEl)
 * - attrs: plain attributes; `html` sets innerHTML (use with bidi(), never with raw user input)
 * - children: strings or elements (null/false are skipped)
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "html") el.innerHTML = value;
    else el.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    el.append(child);
  }
  return el;
}

/** Read a design token, e.g. cssVar("--t-fdm") -> "#4da3ff". Use this in JS/SVG instead of hex. */
export function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
