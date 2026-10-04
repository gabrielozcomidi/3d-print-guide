/**
 * CoreXY, front view: the Z axis. The head slides left/right along a fixed rail (X); the bed rides
 * on two vertical rails and LOWERS by one layer after each layer. (The Y movement is the head
 * moving in and out of the screen: the top view shows that part.)
 * The layer being drawn sits at the nozzle height; layer k is at y = TIP + drop - LH*k, so it
 * moves down with the bed.
 */
import { svgEl } from "../lib/svg.js";
import { movingLegend, runLoop, set, printProgress } from "./kit.js";

export const legend = movingLegend;
const LH = 14;
const LAYERS = 6;
const TIP = 130; // y of the nozzle tip (never changes)
const PART_X = 150;
const PART_W = 100;

export function create(svg, { animate }) {
  svg.setAttribute("viewBox", "0 0 400 300");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "מבט חזית: הראש נע ימינה ושמאלה, והמיטה יורדת שכבה אחת אחרי כל שכבה");

  const frame = svgEl("rect", { class: "d-fixed", x: 30, y: 20, width: 340, height: 260, rx: 6 });
  const rail = svgEl("rect", { class: "d-fixed", x: 40, y: 64, width: 320, height: 14, rx: 4 }); // X rail, fixed height
  const zRails = [100, 300].map((x) => svgEl("line", { class: "d-fixed", x1: x, y1: 100, x2: x, y2: 280 }));
  const bed = svgEl("rect", { class: "d-move", x: 90, width: 220, height: 10, rx: 3 });
  const layers = Array.from({ length: LAYERS }, () => svgEl("rect", { class: "d-layer", x: PART_X, width: 0, height: LH - 1 }));
  const head = svgEl(
    "g",
    {},
    svgEl("rect", { class: "d-move", x: -16, y: 78, width: 32, height: 26, rx: 3 }),
    svgEl("polygon", { class: "d-tip", points: `-7,104 7,104 0,${TIP}` })
  );
  const arrow = svgEl("path", { class: "d-mark", d: "M335 150 V176 M329 170 L335 177 L341 170" }); // "bed goes down" cue
  svg.replaceChildren(frame, rail, ...zRails, ...layers, bed, head, arrow);

  function draw(p) {
    const u = printProgress(p) * LAYERS;
    const i = Math.min(Math.floor(u), LAYERS - 1);
    const f = u - i;
    const done = printProgress(p) >= 1;
    const sweep = done ? 1 : Math.min(f / 0.75, 1); // 0..0.75 of a layer: the head sweeps
    const z = done ? 1 : f < 0.75 ? 0 : (f - 0.75) / 0.25; // last quarter: the bed lowers
    const drop = LH * (i + z);
    const leftToRight = i % 2 === 0;

    set(bed, { y: TIP + LH + drop });
    layers.forEach((layer, k) => {
      const w = k < i || done ? PART_W : k === i ? PART_W * sweep : 0;
      set(layer, { y: TIP + drop - LH * k, width: w, x: k % 2 === 1 ? PART_X + PART_W - w : PART_X });
    });
    set(head, { transform: `translate(${PART_X + PART_W * (leftToRight ? sweep : 1 - sweep)} 0)` });
    set(arrow, { opacity: z > 0 && z < 1 ? 1 : 0 }); // "bed goes down" cue only while it moves
  }
  return { legend, ...runLoop(draw, { animate, duration: 10 }) };
}
