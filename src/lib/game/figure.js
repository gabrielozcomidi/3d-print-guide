/**
 * Print Day: the object drawing that stays on screen through the whole game.
 * It draws an object from its `parts` (data/game.js) in a side view, as ONE silhouette (parts are drawn
 * as a thick ink shape, then paper on top, so overlapping parts do not show lines through each other).
 * The printed part gets the technology colour, growing from the bed as steps are completed.
 *
 * Layers (bottom to top): ink outline, paper, printed fill (clipped by progress), slice lines (clipped to the
 * shape), supports, overlay (markers added by a step; always crisp, no wobble).
 * Ids used inside the SVG are unique because only one figure exists on the page.
 */
import { svgEl } from "../svg.js";
import { gsap, prefersReducedMotion } from "../reveal.js";

const TOP = 100; // model height that maps to the top of the drawing

/** Side-view shapes for a list of parts. y is flipped (SVG y grows downward). */
export function partShapes(parts, attrs = {}) {
  return parts.map((p) => {
    const [x, y] = p.at;
    const [w, hgt] = p.size;
    if (p.shape === "ellipsoid") return svgEl("ellipse", { cx: x, cy: -(y + hgt / 2), rx: w / 2, ry: hgt / 2, ...attrs });
    if (p.shape === "cone") return svgEl("polygon", { points: `${x - w / 2},${-y} ${x + w / 2},${-y} ${x},${-(y + hgt)}`, ...attrs });
    return svgEl("rect", { x: x - w / 2, y: -(y + hgt), width: w, height: hgt, ...attrs }); // box and cylinder look alike from the side
  });
}

/** A small standalone picture of an object (for the choose tiles). No ids, no clip. */
export function miniObject(obj) {
  const svg = svgEl("svg", { class: "game-mini", viewBox: "-60 -104 120 112", "aria-hidden": "true", focusable: "false" });
  const g = svgEl("g", { class: "wobble" });
  g.append(...partShapes(obj.parts, { class: "fig-ink" }), ...partShapes(obj.parts, { class: "fig-paper" }), svgEl("line", { class: "fig-bed", x1: -58, y1: 1, x2: 58, y2: 1 }));
  svg.append(g);
  return svg;
}

export function createFigure() {
  const svg = svgEl("svg", { class: "game-figure", viewBox: "-64 -108 128 118", role: "img", "aria-label": "הדגם שנבנה" });
  const clipProgress = svgEl("clipPath", { id: "game-clip-progress" }, svgEl("rect", { x: -70, y: 0, width: 140, height: 0 }));
  const clipShape = svgEl("clipPath", { id: "game-clip-shape" });
  svg.append(svgEl("defs", {}, clipProgress, clipShape));

  const shape = svgEl("g", { class: "wobble" }); // everything that is a drawn line
  const outline = svgEl("g");
  const paper = svgEl("g");
  const printed = svgEl("g", { "clip-path": "url(#game-clip-progress)" });
  const cuts = svgEl("g", { class: "fig-cuts", "clip-path": "url(#game-clip-shape)" });
  const supports = svgEl("g", { class: "fig-supports" });
  const overlay = svgEl("g", { class: "fig-overlay" });
  shape.append(svgEl("line", { class: "fig-bed", x1: -62, y1: 1, x2: 62, y2: 1 }), outline, paper, printed, cuts, supports);
  svg.append(shape, overlay);

  const rect = clipProgress.firstChild;
  const fill = { f: 0 };
  let tween = null;
  const drawFill = () => {
    const hgt = TOP * fill.f;
    rect.setAttribute("y", String(-hgt));
    rect.setAttribute("height", String(hgt + 2));
  };

  return {
    svg,
    overlay,
    /** show an object (or nothing when obj is null); clears supports, slice lines and progress */
    setObject(obj) {
      for (const g of [outline, paper, printed, cuts, supports, overlay]) g.replaceChildren();
      clipShape.replaceChildren();
      fill.f = 0;
      drawFill();
      if (!obj) return;
      outline.append(...partShapes(obj.parts, { class: "fig-ink" }));
      paper.append(...partShapes(obj.parts, { class: "fig-paper" }));
      printed.append(...partShapes(obj.parts, { class: "fig-print" }));
      clipShape.append(...partShapes(obj.parts));
      svg.setAttribute("aria-label", `הדגם: ${obj.name}`);
    },
    /** how much of the printed colour is filled, 0..1 (animated unless the user prefers reduced motion) */
    setProgress(f) {
      tween?.kill();
      if (prefersReducedMotion()) {
        fill.f = f;
        drawFill();
        return;
      }
      tween = gsap.to(fill, { f, duration: 0.6, ease: "power2.out", onUpdate: drawFill });
    },
    /** thin horizontal slice lines, n of them across the whole height (step 3 preview); 0 removes them */
    showCuts(n) {
      cuts.replaceChildren();
      for (let i = 1; i < n; i++) {
        const y = -(TOP * i) / n;
        cuts.append(svgEl("line", { x1: -70, y1: y.toFixed(2), x2: 70, y2: y.toFixed(2) }));
      }
    },
    /** a little zig-zag support column under a spot the player marked */
    addSupport(spot) {
      const [x, y] = spot.at;
      const pts = [];
      const len = Math.min(14, y);
      for (let i = 0; i <= 6; i++) pts.push(`${(x + (i % 2 ? 2.2 : -2.2)).toFixed(1)},${(-y + (len * i) / 6).toFixed(1)}`);
      supports.append(svgEl("polyline", { points: pts.join(" "), "data-spot": spot.id }));
    },
    clearOverlay() {
      overlay.replaceChildren();
    },
  };
}
