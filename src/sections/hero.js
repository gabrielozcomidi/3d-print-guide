// Section: hero. A giant title, one justified paragraph, the technology list, and a hand-drawn
// printer that draws itself once on load. That drawing is the page's only entrance animation.
import "../styles/hero.css";
import { h } from "../lib/dom.js";
import { bidi } from "../lib/bidi.js";
import { svgEl } from "../lib/svg.js";
import { gsap, prefersReducedMotion } from "../lib/reveal.js";
import { hero } from "../data/copy.js";
import { startPaths } from "../data/chapters.js";
import { flowArrow } from "../lib/arrow.js";
import { link } from "../lib/router.js";

const LAYERS = 5;
const LAYER_H = 16; // pitch of the stack, in drawing units
const PLATE_Y = 300;
const HEAD_X = 210; // centre line of the nozzle
const SWEEP = 76; // how far the nozzle travels each side of the centre while printing one layer
const GAP = 2; // nozzle tip above the layer it is printing
const REST_DY = 0; // head height when the part is finished (also the static picture)
// Head offset (y) while printing layer i: the tip (y=205 at offset 0) sits just above that layer's top edge.
const headY = (i) => PLATE_Y - LAYER_H * (i + 1) - GAP - 205;

/** Line drawing: a nozzle over a stack of layers. Shapes get pathLength=1 so one dash value draws any of them. */
function buildDrawing() {
  const svg = svgEl("svg", { class: "hero-art", viewBox: "0 0 420 330", role: "img", "aria-label": "איור ביד חופשית: פיית הדפסה בונה ערימת שכבות, שכבה אחרי שכבה" });
  const ink = (tag, attrs) => svgEl(tag, { pathLength: 1, ...attrs });

  const plate = ink("rect", { x: 50, y: PLATE_Y, width: 320, height: 16, rx: 3 });
  const layers = Array.from({ length: LAYERS }, (_, i) =>
    // each layer sits a hair off-centre, like a hand-stacked pile
    ink("rect", { class: "fill", x: 130 + (i % 2 ? 5 : -3), y: PLATE_Y - LAYER_H * (i + 1), width: 160, height: 15 })
  );
  const heater = ink("rect", { x: 170, y: 118, width: 80, height: 52, rx: 6 });
  const tip = ink("polygon", { points: "188,170 232,170 210,205" });
  // the line of freshly laid plastic trails behind the nozzle (flipped when the nozzle runs the other way)
  const bead = ink("path", { d: "M184 207 q-10 -9 -20 0 t-20 0 t-20 0" });
  const head = svgEl("g", { class: "hero-art__head" }, heater, tip, bead);
  // the filament hangs from a fixed point above; its lower end follows the head (see place())
  const filament = ink("path", {});

  /** Put the head at (x, y) offset and stretch the filament between its fixed top and the heater. */
  const place = (x, y) => {
    head.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    const top = 118 + y; // heater top edge
    const f = (top + 4) / 122; // 1 at the original height: scales the wiggle so the line always spans top..heater
    const at = (k) => (top - 122 * f * k).toFixed(1);
    filament.setAttribute("d", `M${HEAD_X + x} ${top} C${HEAD_X + x - 30} ${at(0.21)} ${HEAD_X + x + 30} ${at(0.36)} ${HEAD_X + x} ${at(0.57)} S${HEAD_X + x - 30} ${at(0.87)} ${HEAD_X + x} ${at(1)}`);
  };
  place(0, REST_DY);

  svg.append(plate, ...layers, filament, head);
  return { svg, plate, layers, heater, tip, filament, head, bead, place };
}

/**
 * Print the stack over and over: for each layer the nozzle rises one step, sweeps across (alternating
 * direction) laying the layer down behind it, then when the part is done it is wiped away and the
 * nozzle drops back to the bed. Returns a paused-able GSAP timeline.
 */
function printLoop({ layers, bead, place }) {
  const pos = { x: 0, y: headY(0) };
  const apply = () => place(pos.x, pos.y);
  const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.2 });

  // start of every round: empty bed, nozzle low, left of the first layer
  loop.call(() => { pos.x = -SWEEP; pos.y = headY(0); apply(); });
  loop.set(layers, { opacity: 1, clipPath: "inset(0 100% 0 0)" });
  loop.set(bead, { opacity: 1 });

  layers.forEach((layer, i) => {
    const dir = i % 2 ? -1 : 1; // 1: left to right, -1: right to left
    loop.set(bead, { scaleX: dir, svgOrigin: `${HEAD_X} 207` });
    // rise one layer and get to the start side of this layer
    loop.to(pos, { x: -dir * SWEEP, y: headY(i), duration: i === 0 ? 0.01 : 0.4, ease: "power2.inOut", onUpdate: apply });
    // sweep: the layer is revealed exactly as far as the nozzle has travelled
    const from = dir === 1 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)";
    loop.set(layer, { clipPath: from });
    loop.to(pos, { x: dir * SWEEP, duration: 1.1, ease: "none", onUpdate: apply }, ">");
    loop.to(layer, { clipPath: "inset(0 0% 0 0%)", duration: 1.1, ease: "none" }, "<");
  });

  // part finished: lift the nozzle away, hold, then wipe the stack away from the top down
  loop.set(bead, { opacity: 0 });
  loop.to(pos, { x: 0, y: REST_DY, duration: 0.6, ease: "power2.inOut", onUpdate: apply });
  loop.to({}, { duration: 1.2 }); // hold the finished part
  loop.to([...layers].reverse(), { opacity: 0, duration: 0.35, stagger: 0.12 });
  return loop;
}

export function render(el) {
  const art = buildDrawing();
  const { svg } = art;

  el.append(
    // title and intro on the reading side (right), the printing drawing on the other side (left)
    h("div", { class: "hero__top" }, h("div", { class: "hero__text" }, h("h1", { html: bidi(hero.title) }), h("p", { class: "section__intro", html: bidi(hero.intro) })), h("div", { class: "hero__art" }, svg)),
    // task-based starting points: what people come here to do
    h("div", { class: "paths" }, h("h2", { class: "paths__title" }, "מאיפה מתחילים?"), h("ul", {}, startPaths.map((p) => h("li", {}, link(p.target, { class: "paths__link" }, h("span", { html: bidi(p.label) }), flowArrow())))))
  );

  if (prefersReducedMotion()) return; // static drawing: finished part under the nozzle, no loop

  // Intro: draw the machine stroke by stroke, once. Then print the stack forever.
  const { plate, heater, tip, filament, layers, bead } = art;
  const outlines = [plate, heater, tip, filament];
  art.place(-SWEEP, headY(0)); // draw the machine where the printing starts, so the loop begins without a jump
  outlines.forEach((p) => gsap.set(p, { strokeDasharray: 1, strokeDashoffset: 1 }));
  gsap.set(layers, { opacity: 0 });
  gsap.set(bead, { opacity: 0 });
  const tl = gsap.timeline({ delay: 0.3 });
  tl.to(outlines, { strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut", stagger: 0.15 });
  tl.set(outlines, { strokeDasharray: "none" }); // dashes off so the finished lines are solid
  tl.add(printLoop(art));

  // Looping diagrams pause when off-screen (the other chapters hide the hero, which counts as off-screen).
  new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.1 }).observe(svg);
}
