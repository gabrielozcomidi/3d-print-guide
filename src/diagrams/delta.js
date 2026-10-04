/**
 * Delta, seen from the front. The bed never moves. Three arms hang from three vertical towers;
 * each tower's carriage slides up or down, and where the three arms meet is the nozzle.
 * The towers at the left and right are exact for this view. The third tower (dashed) is behind,
 * so its height is an approximation, enough to show it moving too.
 * Carriage height = nozzle height + sqrt(armLength^2 - horizontal distance^2).
 */
import { svgEl } from "../lib/svg.js";
import { movingLegend, runLoop, set, printProgress } from "./kit.js";

export const legend = movingLegend;
const BED_TOP = 248;
const ARM = 180; // arm length
const TOWERS = [
  { x: 70, back: false },
  { x: 330, back: false },
  { x: 200, back: true },
];
const LAYERS = 6;
const LAYER_H = 7;
const X_MIN = 170; // the part is 60 wide
const X_MAX = 230;

export function create(svg, { animate }) {
  svg.setAttribute("viewBox", "0 0 400 300");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "מבט חזית: שלוש עגלות על מגדלים עולות ויורדות ומזיזות את הראש, והמיטה קבועה");

  const bed = svgEl("rect", { class: "d-fixed", x: 120, y: BED_TOP, width: 160, height: 10, rx: 3 });
  const rails = TOWERS.map((t) => svgEl("line", { class: t.back ? "d-fixed d-back" : "d-fixed", x1: t.x, y1: 8, x2: t.x, y2: BED_TOP + 10 }));
  const layers = Array.from({ length: LAYERS }, (_, i) =>
    svgEl("rect", { class: "d-layer", x: X_MIN, y: BED_TOP - LAYER_H * (i + 1), width: 0, height: LAYER_H - 1 })
  );
  const arms = TOWERS.map((t) => svgEl("line", { class: t.back ? "d-arm d-back" : "d-arm" }));
  const carriages = TOWERS.map((t) => svgEl("rect", { class: "d-move", x: t.x - 9, width: 18, height: 22, rx: 3 }));
  const effector = svgEl("rect", { class: "d-move", x: -15, y: -6, width: 30, height: 12, rx: 3 });
  const tip = svgEl("polygon", { class: "d-tip", points: "-5,6 5,6 0,12" });
  const head = svgEl("g", {}, effector, tip);
  svg.replaceChildren(bed, ...rails, ...layers, ...arms, ...carriages, head);

  function draw(p) {
    // Same pattern as FDM: sweep across, grow the layer, step up one layer.
    const u = printProgress(p) * LAYERS;
    const i = Math.min(Math.floor(u), LAYERS - 1);
    const f = u - i;
    const done = printProgress(p) >= 1;
    const x = done ? (LAYERS - 1) % 2 === 0 ? X_MAX : X_MIN : i % 2 === 0 ? X_MIN + (X_MAX - X_MIN) * f : X_MAX - (X_MAX - X_MIN) * f;
    const layerTop = BED_TOP - LAYER_H * (i + 1);
    const y = layerTop - 12; // effector centre; its tip touches the layer top

    layers.forEach((layer, k) => {
      const full = k < i || done;
      const w = full ? X_MAX - X_MIN : k === i ? (X_MAX - X_MIN) * f : 0;
      const fromRight = k % 2 === 1;
      set(layer, { width: w, x: fromRight ? X_MAX - w : X_MIN });
    });

    set(head, { transform: `translate(${x} ${y})` });
    TOWERS.forEach((t, k) => {
      const dx = x - t.x;
      const carriageY = y - Math.sqrt(ARM * ARM - dx * dx); // inverse kinematics
      set(carriages[k], { y: carriageY - 11 });
      set(arms[k], { x1: t.x, y1: carriageY, x2: x, y2: y });
    });
  }
  return { legend, ...runLoop(draw, { animate, duration: 10 }) };
}
