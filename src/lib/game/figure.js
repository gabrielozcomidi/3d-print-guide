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

/** Half the object's width at height y (largest of the parts that reach that height); used to sweep the nozzle across it. */
export function halfWidthAt(parts, y) {
  let best = 0;
  for (const p of parts) {
    const [, py] = p.at;
    const [w, hgt] = p.size;
    if (y < py || y > py + hgt) continue;
    const t = (y - py) / hgt; // 0 at the bottom of the part, 1 at the top
    let half = w / 2;
    if (p.shape === "ellipsoid") half = (w / 2) * Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
    else if (p.shape === "cone") half = (w / 2) * (1 - t);
    best = Math.max(best, half);
  }
  return best;
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

  let current = null; // the object being shown
  let nozzle = null;
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
      current = obj;
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
    /**
     * Print the object layer by layer: a nozzle rises one layer at a time and sweeps across it (alternating
     * direction), the printed colour grows behind it. Same idea as the home-page drawing.
     * @param {number} layers how many layers to draw (from the slicing choice)
     * @param {{onDone?:()=>void}} opts
     */
    print(layers, { onDone } = {}) {
      this.stopPrint();
      if (!current || prefersReducedMotion()) {
        fill.f = 1;
        drawFill();
        onDone?.();
        return;
      }
      nozzle = svgEl("g", { class: "fig-nozzle" }, svgEl("line", { x1: 0, y1: -13, x2: 0, y2: -40 }), svgEl("rect", { x: -5, y: -13, width: 10, height: 8, rx: 1.5 }), svgEl("polygon", { points: "-3,-5 3,-5 0,0" }));
      overlay.append(nozzle);
      const parts = current.parts;
      const T = { t: 0 };
      const duration = Math.min(6.5, 2.5 + layers * 0.04);
      tween?.kill();
      tween = gsap.to(T, {
        t: 1,
        duration,
        ease: "none",
        onUpdate: () => {
          const i = Math.min(layers - 1, Math.floor(T.t * layers));
          const within = T.t * layers - i; // 0..1 along the current layer
          fill.f = (i + (within > 0.05 ? 1 : 0)) / layers; // a layer appears when the nozzle starts it: stepped, not smooth
          drawFill();
          const y = ((i + 1) / layers) * TOP;
          const reach = halfWidthAt(parts, y - 0.5) + 2;
          const x = (i % 2 ? 1 - within : within) * 2 * reach - reach; // boustrophedon sweep
          nozzle.setAttribute("transform", `translate(${x.toFixed(1)} ${-y.toFixed(1)})`);
        },
        onComplete: () => {
          fill.f = 1;
          drawFill();
          nozzle?.remove();
          nozzle = null;
          onDone?.();
        },
      });
    },
    stopPrint() {
      tween?.kill();
      nozzle?.remove();
      nozzle = null;
    },
    clearOverlay() {
      overlay.replaceChildren();
      nozzle = null;
    },
  };
}
