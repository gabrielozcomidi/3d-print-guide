/**
 * A bulleted list where every item has a text marker (+, -, check, dot) in front.
 * The item text is wrapped in ONE span on purpose: list items are CSS grids, and without the
 * wrapper each English term (<bdi>) inside a sentence would become its own grid cell.
 */
import { h } from "./dom.js";
import { bidi } from "./bidi.js";

/** @param {string[]} items @param {string} mark glyph shown before each item @param {string} [cls] extra class */
export function markList(items, mark, cls = "") {
  return h(
    "ul",
    { class: `list ${cls}`.trim() },
    items.map((text) => h("li", { "data-mark": mark }, h("span", { html: bidi(text) })))
  );
}
