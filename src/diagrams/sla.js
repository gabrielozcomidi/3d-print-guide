/**
 * SLA process diagram (bottom-up): the build plate hangs in a vat of resin. A laser under the
 * vat traces the layer through a clear window; the plate then lifts to peel the layer off.
 * Same contract as fdm.js. Physical drawing: not mirrored in RTL.
 */
import { gsap } from "../lib/reveal.js";
import { svgEl } from "../lib/svg.js";

const LAYERS = 6;
const LAYER_H = 12;
const PART_X = 140;
const PART_W = 120;
const CURE_BOTTOM = 234; // world y of the bottom of the layer being cured (just above the film)
const FIRST_LAYER_Y = CURE_BOTTOM - LAYER_H; // 222
const PEEL = 26; // how far the plate lifts to peel each layer
const GALVO = { x: 200, y: 276 };

// kind = how the legend glyph is drawn (see .legend in technologies.css): dash | box | hot | fill | line | resin
export const legend = [
  { label: "לייזר UV", kind: "hot" },
  { label: "שרף נוזלי", kind: "resin" },
  { label: "החלק", kind: "fill" },
  { label: "פלטת בנייה", kind: "line" },
  { label: "סרט שקוף בתחתית", kind: "dash" },
];

export function create(svg, { animate, onStep = () => {} }) {
  svg.setAttribute("viewBox", "0 0 400 300");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "לייזר מתחת לאמבט שרף מקשה שכבה, והפלטה עולה ומקלפת אותה");

  // --- static scene: vat, resin, film, laser source ------------------------
  const resin = svgEl("rect", { class: "d-resin", x: 71, y: 150, width: 258, height: 86 });
  const vat = svgEl("path", { class: "d-vat", d: "M70 140 V240 H330 V140" });
  const film = svgEl("line", { class: "d-film", x1: 71, y1: 236, x2: 329, y2: 236 });
  const galvo = svgEl("rect", { class: "d-galvo", x: GALVO.x - 22, y: GALVO.y, width: 44, height: 18, rx: 3 });

  // --- moving assembly: rod + plate + part, translated together ------------
  const rod = svgEl("rect", { class: "d-plate", x: 197, y: -20, width: 6, height: FIRST_LAYER_Y - 10 + 20 });
  const plate = svgEl("rect", { class: "d-plate", x: 120, y: FIRST_LAYER_Y - 10, width: 160, height: 10, rx: 2 });
  const layers = Array.from({ length: LAYERS }, (_, i) =>
    svgEl("rect", {
      class: "d-layer",
      x: PART_X,
      y: FIRST_LAYER_Y + i * LAYER_H, // coordinates inside the assembly; world y changes as it lifts
      width: animate ? 0 : PART_W,
      height: LAYER_H - 1,
    })
  );
  const asm = svgEl("g", {}, rod, plate, ...layers);

  // Laser beam: from the galvo mirror up to the point being cured.
  const beam = svgEl("line", { class: "d-beam", x1: GALVO.x, y1: GALVO.y, x2: PART_X, y2: CURE_BOTTOM });
  const dot = svgEl("circle", { class: "d-dot", cx: PART_X, cy: CURE_BOTTOM, r: 3.5 });
  const laser = svgEl("g", { opacity: 0 }, beam, dot);

  svg.replaceChildren(resin, vat, film, galvo, asm, laser);

  // Rest pose: finished print lifted out of the resin.
  if (!animate) {
    gsap.set(asm, { y: -LAYERS * LAYER_H - PEEL });
    return { legend, play() {}, pause() {}, destroy() {} };
  }

  const tl = gsap.timeline({ repeat: -1, paused: true });
  tl.set(layers, { attr: { width: 0 }, opacity: 1 }, 0);
  tl.set(asm, { y: 0 }, 0);
  tl.set(laser, { opacity: 0 }, 0);

  const pos = { x: PART_X }; // proxy value the laser sweep animates; onUpdate copies it to the SVG
  const aim = () => {
    beam.setAttribute("x2", pos.x);
    dot.setAttribute("cx", pos.x);
  };

  for (let i = 0; i < LAYERS; i++) {
    const dur = i === 0 ? 1.5 : 0.9;

    // 1) cure: laser sweeps across, the layer grows under it
    tl.call(onStep, [0]);
    tl.set(laser, { opacity: 1 });
    tl.addLabel(`cure${i}`);
    tl.fromTo(pos, { x: PART_X }, { x: PART_X + PART_W, duration: dur, ease: "none", onUpdate: aim }, `cure${i}`);
    tl.to(layers[i], { attr: { width: PART_W }, duration: dur, ease: "none" }, `cure${i}`);
    tl.set(laser, { opacity: 0 });

    // 2) peel: plate lifts well above the film so the layer detaches
    tl.call(onStep, [1]);
    tl.to(asm, { y: -(i + 1) * LAYER_H - PEEL, duration: 0.5, ease: "power2.out" });

    // 3) next layer: plate comes back down to one layer above the film
    tl.call(onStep, [2]);
    if (i < LAYERS - 1) tl.to(asm, { y: -(i + 1) * LAYER_H, duration: 0.4, ease: "power2.inOut" });
  }

  tl.to({}, { duration: 1.2 });
  tl.to(layers, { opacity: 0, duration: 0.4 });
  tl.to(asm, { y: 0, duration: 0.6, ease: "power2.inOut" });

  return {
    legend,
    play() { tl.play(); },
    pause() { tl.pause(); },
    destroy() { tl.kill(); },
  };
}
