/**
 * Belt printer, seen from the side. The bed is a conveyor belt. The nozzle is tilted 45 degrees
 * and slides along a tilted rail, building one slanted slice at a time; after each slice the belt
 * advances by one layer. So the part grows sideways, without a length limit.
 */
import { svgEl } from "../lib/svg.js";
import { movingLegend, runLoop, set, printProgress } from "./kit.js";

export const legend = movingLegend;
const BELT_Y = 212; // top surface of the belt
const X0 = 105; // where each slice is built (fixed in the world)
const H = 100; // slice height along the slope
const PITCH = 7; // belt advance per layer = layer thickness
const THICK = 6; // horizontal thickness of one slice
const SLICES = 10;
const BELT_DASH = 24; // dash pattern length of the belt marks, so they loop seamlessly

export function create(svg, { animate }) {
  svg.setAttribute("viewBox", "0 0 400 300");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "מבט צד: ראש מוטה ב־45 מעלות בונה פרוסות משופעות על חגורה נעה");

  const loop = svgEl("rect", { class: "d-move", x: 46, y: BELT_Y, width: 308, height: 44, rx: 22 });
  const marks = svgEl("line", { class: "d-belt-marks", x1: 70, y1: BELT_Y + 22, x2: 330, y2: BELT_Y + 22 });
  const rollers = [70, 330].map((x) => svgEl("circle", { class: "d-fixed", cx: x, cy: BELT_Y + 22, r: 12 }));
  const slices = Array.from({ length: SLICES }, () => svgEl("polygon", { class: "d-layer" }));
  // fixed tilted rail, parallel to the slice direction, offset along the nozzle axis
  const rail = svgEl("line", { class: "d-fixed", x1: X0 - 36, y1: BELT_Y - 36, x2: X0 + H - 36, y2: BELT_Y - H - 36 });
  // nozzle assembly: origin = nozzle tip, body pointing up, then rotated so it points up-left (perpendicular to the slice)
  const body = svgEl("rect", { class: "d-move", x: -14, y: -44, width: 28, height: 30, rx: 3 });
  const tip = svgEl("polygon", { class: "d-tip", points: "-8,-14 8,-14 0,0" });
  const nozzle = svgEl("g", {}, body, tip);
  svg.replaceChildren(loop, marks, ...rollers, rail, ...slices, nozzle);

  function draw(p) {
    const u = printProgress(p) * SLICES;
    const k = Math.min(Math.floor(u), SLICES - 1);
    const f = u - k;
    const done = printProgress(p) >= 1;
    // phases within one layer: rise (0-0.6), return (0.6-0.85), belt advances (0.85-1)
    const rise = Math.min(f / 0.6, 1);
    const back = f > 0.6 ? Math.min((f - 0.6) / 0.25, 1) : 0;
    const shift = f > 0.85 ? (f - 0.85) / 0.15 : 0;
    const s = done ? 0 : H * (rise - back); // nozzle position along the slope
    const belt = PITCH * ((done ? SLICES : k) + (done ? 0 : shift)); // total belt travel so far

    set(marks, { "stroke-dashoffset": -belt % BELT_DASH });
    slices.forEach((el, j) => {
      const h = j < k || done ? H : j === k ? H * rise : 0;
      const x = X0 + belt - PITCH * j; // created at X0 when the belt had advanced PITCH*j
      set(el, {
        points: `${x},${BELT_Y} ${x + THICK},${BELT_Y} ${x + THICK + h},${BELT_Y - h} ${x + h},${BELT_Y - h}`,
        opacity: h > 0 ? 1 : 0,
      });
    });
    set(nozzle, { transform: `translate(${X0 + s} ${BELT_Y - s}) rotate(-45)` });
  }
  return { legend, ...runLoop(draw, { animate, duration: 12 }) };
}
