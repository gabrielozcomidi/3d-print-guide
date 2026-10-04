/** Small data-visualisation widgets for spec cards. Pure DOM, styled in styles/technologies.css. */
import { h } from "./dom.js";
import { ltr } from "./bidi.js";

/**
 * Row of dots, e.g. 3 of 5 filled. Meaning is also in the aria-label, not just the colour.
 * Fill colour comes from --c on a parent element.
 */
export function dotMeter(value, max = 5, label = "", { small = false } = {}) {
  return h(
    "span",
    { class: small ? "dots dots--sm" : "dots", role: "img", "aria-label": `${label} ${value} מתוך ${max}`.trim() },
    Array.from({ length: max }, (_, i) => h("span", { class: i < value ? "dot dot--on" : "dot" }))
  );
}

// Shared axis for layer height. Log scale because layer heights span >10x (0.025 .. 0.4 mm),
// and on a linear axis the fine resin printers would all be squashed into one corner.
const AXIS_MIN = 0.01;
const AXIS_MAX = 0.5;
const pct = (mm) => ((Math.log(mm) - Math.log(AXIS_MIN)) / (Math.log(AXIS_MAX) - Math.log(AXIS_MIN))) * 100;

/**
 * A range bar on the shared log axis (ends:false hides the 0.01 / 0.5 labels, for tables with one axis note). Positioned with logical properties, so the axis runs
 * from the inline-start side (right in Hebrew): thin layers on the right, thick on the left.
 */
export function layerRange({ min, max }, { ends = true } = {}) {
  const bar = h("span", { class: "range__bar" });
  bar.style.insetInlineStart = `${pct(min)}%`;
  bar.style.inlineSize = `${pct(max) - pct(min)}%`;
  return h(
    "div",
    { class: "range" },
    h("div", { class: "range__track" }, bar),
    ends ? h("div", { class: "range__ends", "aria-hidden": "true" }, h("span", { html: ltr(AXIS_MIN) }), h("span", { html: ltr(AXIS_MAX) })) : null
  );
}
