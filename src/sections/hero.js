// Section: hero. A giant title, one justified paragraph, the technology list, and a hand-drawn
// printer that draws itself once on load. That drawing is the page's only entrance animation.
import "../styles/hero.css";
import { h } from "../lib/dom.js";
import { bidi } from "../lib/bidi.js";
import { svgEl } from "../lib/svg.js";
import { gsap, prefersReducedMotion } from "../lib/reveal.js";
import { hero } from "../data/copy.js";
import { technologies } from "../data/technologies.js";
import { startPaths } from "../data/chapters.js";
import { flowArrow } from "../lib/arrow.js";
import { link } from "../lib/router.js";

const LAYERS = 5;

/** Line drawing: a nozzle over a stack of layers. Shapes get pathLength=1 so one dash value draws any of them. */
function buildDrawing() {
  const svg = svgEl("svg", { class: "hero-art", viewBox: "0 0 420 330", role: "img", "aria-label": "איור ביד חופשית: פיית הדפסה מעל ערימת שכבות" });
  const ink = (tag, attrs) => svgEl(tag, { pathLength: 1, ...attrs });

  const plate = ink("rect", { x: 50, y: 300, width: 320, height: 16, rx: 3 });
  const layers = Array.from({ length: LAYERS }, (_, i) =>
    // each layer sits a hair off-centre, like a hand-stacked pile
    ink("rect", { class: "fill", x: 130 + (i % 2 ? 5 : -3), y: 300 - 16 * (i + 1), width: 160, height: 15 })
  );
  const heater = ink("rect", { x: 170, y: 118, width: 80, height: 52, rx: 6 });
  const tip = ink("polygon", { points: "188,170 232,170 210,205" });
  const filament = ink("path", { d: "M210 118 C180 92 240 74 210 50 S180 14 210 -4" });
  const bead = ink("path", { d: "M236 207 q10 -9 20 0 t20 0 t20 0" });
  const parts = [plate, ...layers, heater, tip, filament, bead];

  svg.append(...parts);
  return { svg, parts, layers };
}

export function render(el) {
  const { svg, parts, layers } = buildDrawing();

  el.append(
    h("h1", { html: bidi(hero.title) }),
    h("p", { class: "section__intro", html: bidi(hero.intro) }),
    h("p", { class: "hero__techs" }, technologies.map((t) => h("span", { class: "chip", style: `--c: var(${t.color})`, html: bidi(t.name) }))),
    h("div", { class: "hero__art" }, svg),
    // task-based starting points: what people come here to do
    h("div", { class: "paths" }, h("h2", { class: "paths__title" }, "מאיפה מתחילים?"), h("ul", {}, startPaths.map((p) => h("li", {}, link(p.target, { class: "paths__link" }, h("span", { html: bidi(p.label) }), flowArrow())))))
  );

  if (prefersReducedMotion()) return; // static drawing, fully visible

  // Draw each stroke in turn, then wash colour into the stack. Runs once.
  parts.forEach((p) => gsap.set(p, { strokeDasharray: 1, strokeDashoffset: 1 }));
  gsap.set(layers, { fillOpacity: 0 });
  const tl = gsap.timeline({ delay: 0.3 });
  tl.to(parts, { strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut", stagger: 0.12 });
  tl.to(layers, { fillOpacity: 1, duration: 0.6, stagger: 0.08 }, "-=0.6");
  tl.set(parts, { strokeDasharray: "none" }); // dashes off so the finished lines are solid
}
