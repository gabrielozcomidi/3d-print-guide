/**
 * The site's logo: a tiny printer, drawn like the hero drawing (red ink outline, blue printed layers).
 * A frame with a gantry, a nozzle, and three layers on the bed. Decorative: the site name sits next to it.
 * Styled in styles/base.css (.logo). The favicon in index.html is the same picture.
 * @returns {SVGElement}
 */
import { svgEl } from "./svg.js";

export function printerLogo() {
  return svgEl(
    "svg",
    { class: "logo", viewBox: "0 0 48 48", "aria-hidden": "true", focusable: "false" },
    svgEl("path", { d: "M8 41V7h32v34" }), // frame: two posts and the top bar
    svgEl("path", { d: "M8 15h32" }), // gantry the nozzle slides on
    svgEl("rect", { x: 18, y: 15, width: 12, height: 8, rx: 2 }), // hot end
    svgEl("path", { d: "M21 23h6l-3 5z" }), // nozzle
    svgEl("rect", { class: "fill", x: 15, y: 36, width: 18, height: 4, rx: 1 }), // printed layers, bottom to top
    svgEl("rect", { class: "fill", x: 16, y: 32, width: 16, height: 4, rx: 1 }),
    svgEl("path", { d: "M3 41h42" }) // print bed
  );
}
