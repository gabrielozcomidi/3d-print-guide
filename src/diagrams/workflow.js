/**
 * One small hand-drawn picture per stage of "model to print" (data/workflow.js -> art).
 * The same mug travels through the stages: model -> mesh with a hole -> slices -> toolpath ->
 * file sent to the printer -> first layer -> finished. Every shape has pathLength=1, so `drawIn()`
 * can draw all strokes in one after another with a single dash value.
 * Style classes are the shared ones: .d-fixed (outline), .d-layer (tinted printed colour), .d-mark (thin lines).
 */
import { gsap, prefersReducedMotion } from "../lib/reveal.js";
import { svgEl } from "../lib/svg.js";

const ink = (tag, attrs) => svgEl(tag, { pathLength: 1, ...attrs });
const path = (d, cls = "d-mark") => ink("path", { class: cls, d });
const line = (x1, y1, x2, y2, cls = "d-mark") => ink("line", { class: cls, x1, y1, x2, y2 });

// the mug: body x 90..190 (100 wide), y 50..170
const MUG = { x: 90, y: 50, w: 100, h: 120 };
const body = (cls = "d-layer") => ink("rect", { class: cls, x: MUG.x, y: MUG.y, width: MUG.w, height: MUG.h, rx: 8 });
const handle = (cls = "d-fixed") => path("M190 80 q42 0 42 34 q0 34 -42 34", cls);
const ground = () => line(50, 176, 250, 176, "d-fixed");

const arts = {
  // a solid mug and a little axes triad
  model: () => [body(), handle(), ground(), path("M60 150 V120 M54 126 L60 119 L66 126"), path("M60 150 H92 M85 144 L92 150 L85 156")],

  // the same mug as a triangle mesh, with a hole circled
  check: () => {
    const cells = [];
    for (let j = 0; j < 4; j++) for (let k = 0; k < 5; k++) {
      const x = MUG.x + j * 25;
      const y = MUG.y + k * 24;
      cells.push(path(`M${x} ${y} h25 v24 h-25 Z M${x} ${y + 24} L${x + 25} ${y}`, "d-mark"));
    }
    return [body("d-fixed"), ...cells, handle(), ground(), ink("circle", { class: "d-fixed d-back", cx: 140, cy: 108, r: 14 }), path("M210 30 l8 8 l16 -18", "d-mark")];
  },

  // horizontal slice lines through the mug
  slice: () => {
    const cuts = Array.from({ length: 9 }, (_, i) => line(MUG.x - 10, MUG.y + 10 + i * 13, MUG.x + MUG.w + 10, MUG.y + 10 + i * 13));
    return [body("d-fixed"), handle(), ground(), ...cuts];
  },

  // top view of ONE layer: two perimeter loops and a zigzag infill
  gcode: () => {
    const zig = [];
    let d = "M110 92";
    for (let i = 0; i < 6; i++) d += ` L190 ${92 + i * 9} L110 ${92 + i * 9 + 4.5}`;
    zig.push(path(d));
    return [ink("rect", { class: "d-fixed", x: 90, y: 70, width: 120, height: 100, rx: 14 }), ink("rect", { class: "d-fixed", x: 100, y: 80, width: 100, height: 80, rx: 9 }), ...zig, path("M215 62 l-18 6 m18 -6 l-6 18")];
  },

  // an SD card, an arrow, and a printer; Wi-Fi arcs above
  send: () => [
    path("M50 120 h40 l10 10 v38 h-50 Z", "d-fixed"),
    line(60, 122, 60, 134),
    line(70, 122, 70, 134),
    path("M104 140 H146 M138 132 L146 140 L138 148"),
    ink("rect", { class: "d-fixed", x: 160, y: 80, width: 90, height: 90, rx: 6 }),
    ink("rect", { class: "d-move", x: 198, y: 96, width: 14, height: 14, rx: 2 }),
    line(160, 170, 250, 170, "d-fixed"),
    path("M180 56 q20 -20 40 0 M188 66 q12 -12 24 0 M197 76 q3 -3 6 0"),
  ],

  // plate and the first line of plastic being drawn by a nozzle
  first: () => [
    ink("rect", { class: "d-fixed", x: 50, y: 150, width: 200, height: 14, rx: 3 }),
    ink("rect", { class: "d-layer", x: 90, y: 142, width: 90, height: 7 }),
    ink("rect", { class: "d-fixed", x: 175, y: 96, width: 36, height: 30, rx: 4 }),
    ink("polygon", { class: "d-tip", points: "184,126 202,126 193,142" }),
    path("M150 118 q-12 -6 -24 0 M150 128 q-12 -6 -24 0"),
  ],

  // the finished mug with sparkles
  post: () => [body(), handle(), ground(), path("M70 70 l0 14 M63 77 l14 0"), path("M215 54 l0 12 M209 60 l12 0"), path("M62 120 l0 9 M57.5 124.5 l9 0")],
};

/** Build one stage's picture. */
export function workflowArt(id, label) {
  const svg = svgEl("svg", { class: "workflow-art", viewBox: "0 0 300 200", role: "img", "aria-label": label });
  svg.append(...arts[id]());
  return svg;
}

export const artIds = Object.keys(arts);

/** Draw every stroke in, one after another (skipped with reduced motion). */
export function drawIn(svg) {
  if (prefersReducedMotion()) return;
  const shapes = [...svg.children];
  gsap.set(shapes, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.to(shapes, {
    strokeDashoffset: 0,
    duration: 0.7,
    ease: "power1.inOut",
    stagger: 0.07,
    onComplete: () => gsap.set(shapes, { strokeDasharray: "none" }), // dashes off so finished lines are solid
  });
}
