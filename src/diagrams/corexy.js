/**
 * CoreXY, seen from above. The bed does not move in the plane. Two motors fixed to the frame
 * move the head in both X and Y together: head X = (A + B) / 2, head Y = (A - B) / 2 (in turns of
 * the motors). So the dials show it: both motors the same direction = one axis, opposite
 * directions = the other, one motor alone = diagonal. The belts themselves are left out for clarity.
 */
import { svgEl } from "../lib/svg.js";
import { movingLegend, runLoop, set, squarePoint, trailPath, printProgress } from "./kit.js";

export const legend = movingLegend;
const CX = 200;
const CY = 170;
const HALF = 35;
const DIAL_DEG_PER_PX = 3; // how fast the dial notch turns per pixel of belt travel

/** A fixed motor with a notch that shows its rotation. */
function motor(x, y) {
  const body = svgEl("circle", { class: "d-fixed", cx: x, cy: y, r: 14 });
  const notch = svgEl("line", { class: "d-mark", x1: x, y1: y, x2: x, y2: y - 11 });
  return { nodes: [body, notch], turn: (deg) => set(notch, { transform: `rotate(${deg} ${x} ${y})` }) };
}

export function create(svg, { animate }) {
  svg.setAttribute("viewBox", "0 0 400 300");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "מבט מלמעלה: המיטה קבועה ושני מנועים קבועים מזיזים את הראש בשני הצירים");

  const frame = svgEl("rect", { class: "d-fixed", x: 30, y: 20, width: 340, height: 260, rx: 6 });
  const bed = svgEl("rect", { class: "d-fixed", x: CX - 65, y: CY - 65, width: 130, height: 130, rx: 4 });
  const trail = svgEl("path", { class: "d-trail" });
  const gantry = svgEl("rect", { class: "d-move", x: 40, y: 0, width: 320, height: 16, rx: 4 }); // X rail, slides in Y
  const head = svgEl("rect", { class: "d-move", x: -14, y: -14, width: 28, height: 28, rx: 3 });
  const motorA = motor(52, 40);
  const motorB = motor(348, 40);
  svg.replaceChildren(frame, bed, trail, gantry, head, ...motorA.nodes, ...motorB.nodes);

  function draw(p) {
    const q = printProgress(p);
    const t = (u) => squarePoint(u, CX, CY, HALF);
    const [x, y] = t(q);
    set(trail, { d: trailPath(t, q) });
    set(head, { transform: `translate(${x} ${y})` });
    set(gantry, { y: y - 8 });
    motorA.turn(DIAL_DEG_PER_PX * (x + y)); // A = X + Y
    motorB.turn(DIAL_DEG_PER_PX * (x - y)); // B = X - Y
  }
  return { legend, ...runLoop(draw, { animate }) };
}
