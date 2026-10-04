/**
 * Polar, seen from above. The round bed rotates; the head only slides in and out along one
 * radius. Rotation + in/out = any point. The bed rotates once while the radius follows a
 * four-lobed curve, so the printed line is a flower. The trail is drawn in the bed's own
 * frame (so it rotates with the bed); the head stays on a fixed spoke.
 */
import { svgEl } from "../lib/svg.js";
import { movingLegend, runLoop, set, trailPath, printProgress } from "./kit.js";

export const legend = movingLegend;
const C = { x: 200, y: 150 }; // bed centre
const BED_R = 100;
const radius = (theta) => 58 + 24 * Math.cos(4 * theta);

export function create(svg, { animate }) {
  svg.setAttribute("viewBox", "0 0 400 300");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "מבט מלמעלה: המיטה העגולה מסתובבת והראש נע רק פנימה והחוצה");

  const bed = svgEl("circle", { class: "d-move", cx: C.x, cy: C.y, r: BED_R });
  // spokes make the rotation visible
  const spokes = [0, 60, 120].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return svgEl("line", { class: "d-mark", x1: C.x - 90 * Math.cos(a), y1: C.y - 90 * Math.sin(a), x2: C.x + 90 * Math.cos(a), y2: C.y + 90 * Math.sin(a) });
  });
  const trail = svgEl("path", { class: "d-trail" });
  const bedGroup = svgEl("g", {}, bed, ...spokes, trail);
  const arm = svgEl("rect", { class: "d-fixed", x: C.x, y: C.y - 6, width: 130, height: 12, rx: 3 }); // fixed radial rail
  const head = svgEl("rect", { class: "d-move", x: -12, y: -12, width: 24, height: 24, rx: 3 });
  const hub = svgEl("circle", { class: "d-fixed", cx: C.x, cy: C.y, r: 8 });
  svg.replaceChildren(bedGroup, arm, hub, head);

  function draw(p) {
    const q = printProgress(p);
    const turn = 2 * Math.PI; // one full revolution
    // point on the bed (bed coordinates) at fraction t: the head sits at world angle 0,
    // so on the rotating bed it appears at angle -theta
    const point = (t) => {
      const th = t * turn;
      const r = radius(th);
      return [C.x + r * Math.cos(-th), C.y + r * Math.sin(-th)];
    };
    const th = q * turn;
    set(trail, { d: trailPath(point, q, 160) });
    set(bedGroup, { transform: `rotate(${(th * 180) / Math.PI} ${C.x} ${C.y})` });
    set(head, { transform: `translate(${C.x + radius(th)} ${C.y})` });
  }
  return { legend, ...runLoop(draw, { animate, duration: 10 }) };
}
