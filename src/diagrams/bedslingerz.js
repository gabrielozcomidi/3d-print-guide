/**
 * Cartesian "bed-slinger", side view: the Z axis. The bed slides forward/back (left/right on this
 * screen) under a fixed nozzle position; the gantry carrying the head RISES one layer after each
 * layer (on most bed-slingers the Z motors lift the X gantry, not the bed).
 * Layers are drawn in the bed's own frame, so they travel with it.
 */
import { svgEl } from "../lib/svg.js";
import { movingLegend, runLoop, set, printProgress } from "./kit.js";

export const legend = movingLegend;
const LH = 14;
const LAYERS = 6;
const BED_TOP = 232;
const NOZZLE_X = 200;
const PART_X = 160; // part spans bed coordinates 160..240
const PART_W = 80;
const SWING = 40; // how far the bed slides each way

export function create(svg, { animate }) {
  svg.setAttribute("viewBox", "0 0 400 300");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "מבט מהצד: המיטה נעה קדימה ואחורה, והגשר עם הראש עולה שכבה אחרי שכבה");

  const frame = svgEl("rect", { class: "d-fixed", x: 30, y: 20, width: 340, height: 260, rx: 6 });
  const zRod = svgEl("rect", { class: "d-fixed", x: 52, y: 36, width: 10, height: 240, rx: 3 }); // fixed vertical Z rod
  const bed = svgEl("rect", { class: "d-move", x: 120, y: BED_TOP, width: 160, height: 10, rx: 3 });
  const layers = Array.from({ length: LAYERS }, (_, k) => svgEl("rect", { class: "d-layer", x: PART_X, y: BED_TOP - LH * (k + 1), width: 0, height: LH - 1 }));
  const bedGroup = svgEl("g", {}, bed, ...layers); // everything on the bed slides together

  // gantry: origin = nozzle tip. Block rides the Z rod; an arm carries the head out to the nozzle.
  const gantry = svgEl(
    "g",
    {},
    svgEl("rect", { class: "d-move", x: NOZZLE_X - 146, y: -54, width: 40, height: 40, rx: 3 }), // end-on view of the X gantry
    svgEl("rect", { class: "d-move", x: NOZZLE_X - 106, y: -38, width: 88, height: 14, rx: 3 }), // arm
    svgEl("rect", { class: "d-move", x: NOZZLE_X - 16, y: -46, width: 32, height: 32, rx: 3 }), // head
    svgEl("polygon", { class: "d-tip", points: `${NOZZLE_X - 7},-14 ${NOZZLE_X + 7},-14 ${NOZZLE_X},0` })
  );
  svg.replaceChildren(frame, zRod, bedGroup, gantry);

  function draw(p) {
    const u = printProgress(p) * LAYERS;
    const i = Math.min(Math.floor(u), LAYERS - 1);
    const f = u - i;
    const done = printProgress(p) >= 1;
    const sweep = done ? 1 : Math.min(f / 0.75, 1); // the bed slides during the first part of the layer
    const rise = done ? 1 : f < 0.75 ? 0 : (f - 0.75) / 0.25; // then the gantry lifts one layer
    const leftToRight = i % 2 === 0;
    const s = leftToRight ? sweep : 1 - sweep; // where on the part the nozzle is (0..1)
    const bedOffset = SWING - 2 * SWING * s; // bed slides so that bed coordinate (PART_X + PART_W*s) is under the nozzle

    set(bedGroup, { transform: `translate(${bedOffset} 0)` });
    layers.forEach((layer, k) => {
      const w = k < i || done ? PART_W : k === i ? PART_W * sweep : 0;
      set(layer, { width: w, x: k % 2 === 1 ? PART_X + PART_W - w : PART_X });
    });
    set(gantry, { transform: `translate(0 ${BED_TOP - LH * (i + 1) - LH * rise})` });
  }
  return { legend, ...runLoop(draw, { animate, duration: 10 }) };
}
