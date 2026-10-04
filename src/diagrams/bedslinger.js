/**
 * Cartesian "bed-slinger", seen from above. The head slides left/right on a fixed rail (X);
 * the whole bed, with the part on it, slides forward/back (Y). The square is drawn on the bed,
 * so the printed line moves with it. (Z, the height, only changes between layers.)
 */
import { svgEl } from "../lib/svg.js";
import { movingLegend, runLoop, set, squarePoint, trailPath, printProgress } from "./kit.js";

export const legend = movingLegend;
const CX = 200;
const CY = 170; // y of the rail / nozzle
const HALF = 35; // half the side of the square being printed

export function create(svg, { animate }) {
  svg.setAttribute("viewBox", "0 0 400 300");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "מבט מלמעלה: הראש נע שמאלה וימינה, והמיטה נעה קדימה ואחורה");

  const frame = svgEl("rect", { class: "d-fixed", x: 30, y: 20, width: 340, height: 260, rx: 6 });
  const trail = svgEl("path", { class: "d-trail" });
  const bed = svgEl("rect", { class: "d-move", x: CX - 65, y: CY - 65, width: 130, height: 130, rx: 4 });
  const bedGroup = svgEl("g", {}, bed, trail); // the trail lives on the bed, so it travels with it
  const rail = svgEl("rect", { class: "d-fixed", x: 40, y: CY - 10, width: 320, height: 20, rx: 4 });
  const head = svgEl("rect", { class: "d-move", x: -14, y: -14, width: 28, height: 28, rx: 3 });
  svg.replaceChildren(frame, bedGroup, rail, head);

  function draw(p) {
    const q = printProgress(p);
    const t = (u) => squarePoint(u, CX, CY, HALF); // path in bed coordinates
    const [bx, by] = t(q);
    set(trail, { d: trailPath(t, q) });
    set(head, { transform: `translate(${bx} ${CY})` }); // head only moves in X
    set(bedGroup, { transform: `translate(0 ${CY - by})` }); // bed only moves in Y, to put point `by` under the nozzle
  }
  return { legend, ...runLoop(draw, { animate }) };
}
