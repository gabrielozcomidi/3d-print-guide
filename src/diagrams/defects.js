/**
 * Small hand-drawn pictures of print defects, one per issue (issues.js -> visual).
 * Each entry draws into a 160 x 120 SVG. Same visual language as the machine drawings:
 *   .d-fixed  outline (the machine / reference)       .d-layer  printed material (technology colour --c)
 *   .d-mark   thin line (strings, cracks, arrows)      .d-back   dashed + faint = "how it should look"
 * The wobble filter is added by CSS on the whole picture (see troubleshooting.css).
 *
 * These are pictures, not animations, so they work the same with reduced motion.
 */
import { svgEl } from "../lib/svg.js";

const r = (x, y, w, h, cls = "d-layer") => svgEl("rect", { class: cls, x, y, width: w, height: h });
const p = (d, cls = "d-mark") => svgEl("path", { class: cls, d });
const ln = (x1, y1, x2, y2, cls = "d-mark") => svgEl("line", { class: cls, x1, y1, x2, y2 });
const g = (attrs, ...kids) => svgEl("g", attrs, ...kids);
const plate = (y = 100) => r(10, y, 140, 8, "d-fixed");
const arrow = (x1, y1, x2, y2) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = (da) => `${x2 - 7 * Math.cos(a + da)} ${y2 - 7 * Math.sin(a + da)}`;
  return p(`M${x1} ${y1} L${x2} ${y2} M${h(0.5)} L${x2} ${y2} L${h(-0.5)}`);
};

export const defects = {
  // ---------- FDM ----------
  // a part knocked loose and tilted, with a tangle of plastic above it
  "bed-adhesion": () => [
    plate(100),
    g({ transform: "rotate(-16 85 85)" }, r(55, 78, 60, 8), r(55, 70, 60, 8), r(55, 62, 60, 8)),
    p("M40 52 c10 -22 28 18 40 -2 s30 -26 42 -6 s-14 22 -26 14"),
    p("M118 58 c12 -10 20 6 8 14"),
  ],
  // corners curling up off the plate
  warp: () => [
    plate(104),
    p("M30 58 L130 58 L130 86 Q118 100 105 100 L55 100 Q42 100 30 86 Z", "d-layer"),
    ln(34, 70, 126, 70),
    ln(34, 82, 126, 82),
    arrow(26, 98, 26, 80),
    arrow(134, 98, 134, 80),
  ],
  // two columns joined by thin strings
  stringing: () => [
    plate(104),
    r(28, 48, 26, 56),
    r(106, 48, 26, 56),
    p("M54 56 Q80 74 106 56"),
    p("M54 66 Q80 84 106 66"),
    p("M54 76 Q80 90 106 76"),
  ],
  // wall with gaps between the lines of plastic
  "under-extrusion": () => [
    plate(104),
    r(30, 84, 100, 12),
    r(30, 70, 40, 12),
    r(82, 70, 48, 12),
    r(30, 56, 52, 12),
    r(94, 56, 36, 12),
    r(30, 42, 30, 12),
    r(72, 42, 58, 12),
    r(30, 28, 44, 12),
    r(86, 28, 44, 12),
  ],
  // layers split apart along a crack
  delamination: () => [
    plate(104),
    r(40, 88, 80, 12),
    r(40, 76, 80, 12),
    r(40, 64, 80, 12),
    g({ transform: "translate(6 -12)" }, r(40, 52, 80, 12), r(40, 40, 80, 12), r(40, 28, 80, 12)),
    p("M34 62 l10 -5 l10 5 l10 -5 l10 5 l10 -5 l10 5 l10 -5 l10 5 l14 -5"),
    arrow(22, 58, 22, 44),
    arrow(22, 66, 22, 80),
  ],

  // ---------- Resin ----------
  // plate on top is empty; the part lies in the vat
  "resin-detach": () => [
    r(30, 8, 100, 10, "d-fixed"),
    r(60, 18, 40, 24, "d-fixed d-back"),
    ln(10, 100, 150, 100, "d-fixed"),
    g({ transform: "rotate(14 80 88)" }, r(58, 86, 46, 8), r(58, 78, 46, 8), r(58, 70, 46, 8)),
    arrow(80, 66, 80, 46),
  ],
  // a layer stuck to the film, a hole in the part
  "resin-fep": () => [
    r(30, 8, 100, 10, "d-fixed"),
    r(55, 18, 50, 10),
    r(55, 28, 50, 10),
    r(55, 38, 50, 10),
    r(55, 48, 24, 10),
    ln(10, 100, 150, 100, "d-fixed d-back"),
    r(86, 94, 40, 6),
    arrow(110, 90, 110, 70),
  ],
  // flared base (elephant foot) and rounded, fused corners
  "resin-overexposure": () => [
    ln(10, 104, 150, 104, "d-fixed"),
    r(60, 28, 40, 76, "d-fixed d-back"),
    p("M60 30 Q80 20 100 30 L100 80 L114 94 L114 104 L46 104 L46 94 L60 80 Z", "d-layer"),
    arrow(36, 96, 46, 96),
    arrow(124, 96, 114, 96),
  ],
  // drips and shine on an uncured surface
  "resin-sticky": () => [
    r(40, 34, 80, 44, "d-layer"),
    p("M58 78 q0 16 5 16 q5 0 0 -16"),
    p("M82 78 q0 22 5 22 q5 0 0 -22"),
    p("M104 78 q0 12 5 12 q5 0 0 -12"),
    p("M50 44 l12 -4 M50 54 l22 -6"),
  ],

  // ---------- Powder ----------
  // a flat part bent into a bow
  "powder-warp": () => [
    ln(20, 76, 140, 76, "d-fixed d-back"),
    p("M20 66 Q80 22 140 66 L140 80 Q80 36 20 80 Z", "d-layer"),
    arrow(80, 20, 80, 32),
  ],
  // an orange-peel surface along the top edge
  "powder-rough": () => [
    p("M30 92 V44 q5 -8 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 V92 Z", "d-layer"),
    ...[[48, 60], [72, 70], [96, 58], [110, 78], [60, 80], [84, 54], [120, 64]].map(([x, y]) => svgEl("circle", { class: "d-mark", cx: x, cy: y, r: 2 })),
  ],
  // the real part is smaller than the planned outline
  "powder-shrink": () => [
    r(30, 24, 100, 72, "d-fixed d-back"),
    r(38, 32, 84, 56, "d-layer"),
    arrow(22, 60, 32, 60),
    arrow(138, 60, 128, 60),
    arrow(80, 16, 80, 26),
    arrow(80, 104, 80, 94),
  ],
};

/** Build one defect picture as an SVG element. */
export function defectArt(id, label) {
  const svg = svgEl("svg", { class: "defect-art", viewBox: "0 0 160 120", role: "img", "aria-label": label });
  svg.append(...defects[id]());
  return svg;
}
