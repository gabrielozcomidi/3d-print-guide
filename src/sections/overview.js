// Section: "how it works, in general". A vase is shown in three stages as you scroll: the 3D shape,
// the cut into thin slices (what a "slicer" does), and the layers being built from the bottom up.
import "../styles/overview.css";
import { h } from "../lib/dom.js";
import { bidi } from "../lib/bidi.js";
import { svgEl } from "../lib/svg.js";
import { sectionHeader } from "../lib/section.js";
import { ScrollTrigger, prefersReducedMotion } from "../lib/reveal.js";
import { set } from "../diagrams/kit.js";

const STEPS = [
  { title: "דגם תלת־ממדי", text: "מתחילים בקובץ במחשב: הצורה המושלמת שרוצים להדפיס." },
  { title: "חיתוך לשכבות", text: "תוכנה שנקראת סלייסר (Slicer) חותכת את הדגם לפרוסות דקות, כמו לחתוך כיכר לחם." },
  { title: "בנייה שכבה אחרי שכבה", text: "המדפסת בונה כל פרוסה ואז עוברת לשכבה הבאה. ככל שהפרוסות דקות יותר, המשטח חלק יותר." },
];

const N = 30; // number of layers
const LAYER_H = 7;
const BASE_Y = 250;
const CX = 150;
/** half-width of the vase at height t (0 = bottom, 1 = top) */
const halfWidth = (t) => 34 + 26 * Math.sin(Math.PI * Math.min(1, t * 1.15)) - 12 * t;

/** Builds the vase drawing; returns the svg and draw(p) for progress p = 0..1. */
function buildVase() {
  const svg = svgEl("svg", { class: "vase", viewBox: "0 0 300 270", role: "img", "aria-label": "מגן שכבות: אגרטל שנחתך לפרוסות ונבנה שכבה אחרי שכבה" });

  // outline of the whole shape (both sides)
  const pts = [];
  for (let i = 0; i <= N; i++) pts.push([CX - halfWidth(i / N), BASE_Y - i * LAYER_H]);
  for (let i = N; i >= 0; i--) pts.push([CX + halfWidth(i / N), BASE_Y - i * LAYER_H]);
  const outline = svgEl("path", { class: "d-fixed vase__outline", d: "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L") + "Z" });

  // slice lines
  const cuts = Array.from({ length: N + 1 }, (_, i) => {
    const w = halfWidth(i / N);
    return svgEl("line", { class: "d-mark", x1: CX - w - 6, x2: CX + w + 6, y1: BASE_Y - i * LAYER_H, y2: BASE_Y - i * LAYER_H });
  });
  // layers (built bottom-up)
  const layers = Array.from({ length: N }, (_, i) => {
    const w = halfWidth((i + 0.5) / N);
    return svgEl("rect", { class: "d-move", x: CX - w, y: BASE_Y - (i + 1) * LAYER_H, width: w * 2, height: LAYER_H - 1 });
  });
  const wobbly = svgEl("g", { class: "wobble" }, ...layers, ...cuts, outline);
  svg.append(wobbly);

  /** returns the stage (0-2) shown at progress p */
  function draw(p) {
    const stage = p < 0.28 ? 0 : p < 0.55 ? 1 : 2;
    const cutFrac = stage === 0 ? 0 : stage === 1 ? (p - 0.28) / 0.27 : 1;
    const buildFrac = stage < 2 ? 0 : Math.min(1, (p - 0.55) / 0.42);
    cuts.forEach((c, i) => set(c, { opacity: i / N <= cutFrac ? (stage === 2 ? 0.0 : 1) : 0 }));
    layers.forEach((l, i) => set(l, { opacity: i < buildFrac * N ? 1 : 0 }));
    set(outline, { "stroke-dasharray": stage === 0 ? "6 6" : "none", opacity: stage === 2 ? 0.9 : 1 });
    return stage;
  }
  return { svg, draw };
}

/** @param {HTMLElement} el the <section id="overview"> element */
export function render(el) {
  const { svg, draw } = buildVase();
  const stepItems = STEPS.map((s) => h("li", { class: "step" }, h("strong", { html: bidi(s.title) }), h("span", { html: bidi(s.text) })));
  const mark = (stage) => stepItems.forEach((li, i) => (i === stage ? li.setAttribute("aria-current", "step") : li.removeAttribute("aria-current")));

  const figure = h("div", { class: "overview__figure" }, svg);
  el.append(
    ...sectionHeader("overview"),
    h("div", { class: "overview__top" }, figure, h("ol", { class: "steps" }, stepItems))
  );

  if (prefersReducedMotion()) {
    draw(1); // finished picture, no scroll animation
    return;
  }
  draw(0);
  mark(0);
  // scrub: the drawing advances as the figure scrolls through the middle of the screen
  ScrollTrigger.create({
    trigger: figure,
    start: "top 75%",
    end: "bottom 30%",
    scrub: true,
    onUpdate: (self) => mark(draw(self.progress)),
  });
}
