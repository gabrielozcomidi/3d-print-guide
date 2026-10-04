/**
 * SCARA (a robot arm), seen from above. The bed is fixed. A base joint turns the first link and
 * an elbow joint turns the second, so the head moves along arcs. The two joint angles for each
 * target point come from two-link inverse kinematics (law of cosines).
 */
import { svgEl } from "../lib/svg.js";
import { movingLegend, runLoop, set, squarePoint, trailPath, printProgress } from "./kit.js";

export const legend = movingLegend;
const BASE = { x: 200, y: 38 };
const L1 = 110;
const L2 = 110;
const CX = 200;
const CY = 160;
const HALF = 40;

export function create(svg, { animate }) {
  svg.setAttribute("viewBox", "0 0 400 300");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "מבט מלמעלה: זרוע עם שני מפרקים מסתובבים מזיזה את הראש בקשתות מעל מיטה קבועה");

  const bed = svgEl("rect", { class: "d-fixed", x: CX - 70, y: CY - 70, width: 140, height: 140, rx: 4 });
  const trail = svgEl("path", { class: "d-trail" });
  // each link = a wide ink line with a tinted line on top, so it reads as an outlined bar
  const link = () => [svgEl("line", { class: "d-link" }), svgEl("line", { class: "d-link-fill" })];
  const [l1a, l1b] = link();
  const [l2a, l2b] = link();
  const base = svgEl("circle", { class: "d-fixed", cx: BASE.x, cy: BASE.y, r: 14 });
  const elbow = svgEl("circle", { class: "d-move", r: 8 });
  const head = svgEl("circle", { class: "d-move", r: 7 });
  svg.replaceChildren(bed, trail, l1a, l1b, l2a, l2b, base, elbow, head);

  function draw(p) {
    const q = printProgress(p);
    const t = (u) => squarePoint(u, CX, CY, HALF);
    const [tx, ty] = t(q);
    const dx = tx - BASE.x;
    const dy = ty - BASE.y;
    // two-link inverse kinematics
    const cos2 = Math.max(-1, Math.min(1, (dx * dx + dy * dy - L1 * L1 - L2 * L2) / (2 * L1 * L2)));
    const th2 = Math.acos(cos2);
    const th1 = Math.atan2(dy, dx) - Math.atan2(L2 * Math.sin(th2), L1 + L2 * Math.cos(th2));
    const ex = BASE.x + L1 * Math.cos(th1);
    const ey = BASE.y + L1 * Math.sin(th1);

    set(trail, { d: trailPath(t, q) });
    for (const el of [l1a, l1b]) set(el, { x1: BASE.x, y1: BASE.y, x2: ex, y2: ey });
    for (const el of [l2a, l2b]) set(el, { x1: ex, y1: ey, x2: tx, y2: ty });
    set(elbow, { cx: ex, cy: ey });
    set(head, { cx: tx, cy: ty });
  }
  return { legend, ...runLoop(draw, { animate }) };
}
