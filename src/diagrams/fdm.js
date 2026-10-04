/**
 * FDM process diagram: a heated nozzle sweeps back and forth, laying down one layer at a time.
 *
 * Contract shared by all diagrams (see index.js):
 *   create(svg, { animate, onStep }) -> { legend, play(), pause(), destroy() }
 *   - animate:false (reduced motion) draws the finished end state and never moves.
 *   - onStep(i) is called when the process enters step i of technologies.js -> steps[].
 *
 * The SVG is a physical drawing, so it is NOT mirrored in RTL (the nozzle sweeps left/right
 * regardless of reading direction). Text labels live in the HTML legend, not inside the SVG.
 *
 * Colours come from CSS classes (.d-*) in styles/technologies.css, driven by design tokens.
 */
import { gsap } from "../lib/reveal.js";
import { svgEl } from "../lib/svg.js";

const LAYERS = 6;
const LAYER_H = 14;
const PART_X = 130; // left edge of the part
const PART_W = 140;
const PLATE_Y = 250; // top surface of the build plate

// y of the nozzle tip while it draws layer i: resting on the top edge of the new layer
const tipY = (i) => PLATE_Y - (i + 1) * LAYER_H + 1;

// kind = how the legend glyph is drawn (see .legend in technologies.css): dash | box | hot | fill | line | resin
export const legend = [
  { label: "פילמנט", kind: "dash" },
  { label: "ראש מחומם", kind: "hot" },
  { label: "החלק", kind: "fill" },
  { label: "פלטת הדפסה", kind: "line" },
];

export function create(svg, { animate, onStep = () => {} }) {
  svg.setAttribute("viewBox", "0 0 400 300");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "ראש מחומם נע מצד לצד ומניח שכבות פלסטיק זו על גבי זו");

  // --- static scene -------------------------------------------------------
  const plate = svgEl("rect", { class: "d-plate", x: 60, y: PLATE_Y, width: 280, height: 14, rx: 3 });
  const layers = Array.from({ length: LAYERS }, (_, i) =>
    svgEl("rect", {
      class: "d-layer",
      x: PART_X,
      y: PLATE_Y - (i + 1) * LAYER_H,
      width: animate ? 0 : PART_W,
      height: LAYER_H - 1, // 1px gap so individual layers stay visible
    })
  );

  // Nozzle group: origin (0,0) is the tip, so moving the group moves the whole print head.
  const filament = svgEl("line", { class: "d-filament", x1: 0, y1: -420, x2: 0, y2: -34 });
  const heater = svgEl("rect", { class: "d-heater", x: -20, y: -34, width: 40, height: 22, rx: 3 });
  const glow = svgEl("rect", { class: "d-glow", x: -20, y: -34, width: 40, height: 22, rx: 3 });
  const tip = svgEl("polygon", { class: "d-tip", points: "-9,-12 9,-12 0,0" });
  const nozzle = svgEl("g", {}, filament, heater, glow, tip);

  svg.replaceChildren(plate, ...layers, nozzle);

  // Rest pose: finished print, nozzle parked above it.
  gsap.set(nozzle, { x: PART_X + PART_W / 2, y: tipY(LAYERS) - 14 });
  if (!animate) {
    return { legend, play() {}, pause() {}, destroy() {} };
  }

  // --- main timeline: one pass per layer, loops forever --------------------
  const tl = gsap.timeline({ repeat: -1, paused: true });
  tl.set(layers, { attr: { width: 0, x: PART_X }, opacity: 1 }, 0);
  tl.set(nozzle, { x: PART_X, y: tipY(0) }, 0);

  for (let i = 0; i < LAYERS; i++) {
    const first = i === 0;
    const leftToRight = i % 2 === 0;

    // The first layer shows the full story (push, melt); later layers just repeat sweep + lift.
    if (first) {
      tl.call(onStep, [0]).to({}, { duration: 0.8 });
      tl.call(onStep, [1]).to({}, { duration: 0.8 });
    }
    tl.call(onStep, [2]);
    const sweep = `sweep${i}`;
    const dur = first ? 1.6 : 1;
    tl.addLabel(sweep);
    tl.to(nozzle, { x: leftToRight ? PART_X + PART_W : PART_X, duration: dur, ease: "none" }, sweep);
    // The new layer grows in the direction the nozzle travels.
    if (leftToRight) {
      tl.to(layers[i], { attr: { width: PART_W }, duration: dur, ease: "none" }, sweep);
    } else {
      tl.set(layers[i], { attr: { x: PART_X + PART_W } }, sweep);
      tl.to(layers[i], { attr: { x: PART_X, width: PART_W }, duration: dur, ease: "none" }, sweep);
    }
    tl.call(onStep, [3]);
    tl.to(nozzle, { y: tipY(i + 1), duration: 0.3, ease: "power1.inOut" });
  }

  // Hold the finished part, fade it out, return the nozzle, loop.
  tl.to({}, { duration: 1.2 });
  tl.to(layers, { opacity: 0, duration: 0.4 });
  tl.to(nozzle, { x: PART_X, y: tipY(0), duration: 0.6, ease: "power2.inOut" });

  // --- ambient motion: filament feeding and heater glow --------------------
  // Separate looping timeline because an infinite tween can't live inside a repeating one.
  const ambient = gsap.timeline({ paused: true });
  ambient.to(filament, { attr: { "stroke-dashoffset": -16 }, duration: 0.6, ease: "none", repeat: -1 }, 0);
  ambient.fromTo(glow, { opacity: 0 }, { opacity: 0.55, duration: 0.9, yoyo: true, repeat: -1, ease: "sine.inOut" }, 0);

  return {
    legend,
    play() { tl.play(); ambient.play(); },
    pause() { tl.pause(); ambient.pause(); },
    destroy() { tl.kill(); ambient.kill(); },
  };
}
