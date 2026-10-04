/**
 * Shared "powder bed" scene for SLS, MJF, DMLS and binder jetting (side view, cut through the machine).
 *
 * Two chambers: a FEED chamber on the left (powder in a piston that rises) and the BUILD chamber
 * in the middle (the part is built on a plate that sinks one layer at a time). A roller carries
 * powder from the feed chamber and spreads a thin layer over the build chamber.
 *
 * Everything on screen is a function of the plain object `S` (state). A diagram's timeline tweens
 * the numbers in S and the scene re-renders on every update. The energy source (laser, print head,
 * lamp) is added by the diagram itself (sls.js, mjf.js, ...) and reads the same state.
 *
 * Layer bookkeeping: layer k is created at the powder surface (y = TOP) when `drop` = T*k, and
 * after that moves down together with the plate, so its y is always TOP + drop - T*k.
 */
import { svgEl } from "../lib/svg.js";
import { set } from "./kit.js";

export const T = 8; // thickness of one layer (drawing units)
export const TOP = 100; // y of the powder surface (rim of the chambers)
export const LAYERS = 6;
export const PART_X = 185;
export const PART_W = 60;
const IN_X = 167; // inner left edge of the build chamber
const IN_W = 96;
const FEED_X = 52;
const FEED_W = 71;
const ROLL_FROM = 80;
const ROLL_TO = 255;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * @param {SVGElement} svg
 * @param {{animate:boolean, fromRight?:boolean, metal?:boolean, green?:boolean, onRender?:()=>void}} opts
 *   onRender:  called after every render, so the diagram can draw its energy source from the same state
 *   fromRight: layers fill from the right (a lamp moving right-to-left)
 *   metal:     the first two layers are drawn as thin support pillars
 *   green:     the part is a pale "green" part until the oven step (binder jetting)
 */
export function createBed(svg, { animate, fromRight = false, metal = false, green = false, onRender = () => {} }) {
  // the scene spans x = 50..265, y = 20..272: the viewBox is cropped to it so the drawing fills the frame
  svg.setAttribute("viewBox", "36 6 244 276");
  svg.setAttribute("role", "img");

  /** state: every number the timeline can tween */
  const S = { drop: 0, gap: 1, roller: 0, rollerOn: 0, cover: 0, cur: 0, unpack: 0, feed: 0, oven: 0, f: {} };
  const zeroF = {};
  for (let k = 0; k < LAYERS; k++) zeroF[k] = S.f[k] = 0;
  const initial = { drop: 0, gap: 1, roller: 0, rollerOn: 0, cover: 0, cur: 0, unpack: 0, feed: 0, oven: 0 };

  // ----- elements -----
  const feedPowder = svgEl("rect", { class: "d-powder", x: FEED_X, width: FEED_W });
  const buildPowder = svgEl("rect", { class: "d-powder" });
  const newPowder = svgEl("rect", { class: "d-powder" });
  const powderGroup = svgEl("g", {}, buildPowder, newPowder);
  const feedPlate = svgEl("rect", { class: "d-move", x: FEED_X, width: FEED_W, height: 6, rx: 2 });
  const plate = svgEl("rect", { class: "d-move", x: IN_X, width: IN_W, height: 6, rx: 2 });
  const layers = Array.from({ length: LAYERS }, (_, k) => {
    if (metal && k < 2) {
      // support pillars: five thin columns instead of a full-width layer
      return svgEl("g", { class: "d-comb" }, ...Array.from({ length: 5 }, () => svgEl("rect", { class: "d-layer", height: T - 1 })));
    }
    return svgEl("rect", { class: "d-layer", height: T - 1 });
  });
  const overlay = svgEl("rect", { class: "d-powder d-powder--over", x: IN_X, width: IN_W });
  const walls = svgEl("path", { class: "d-fixed", d: "M165 100 V272 H265 V100 M50 100 V272 H125 V100" });
  const roller = svgEl("circle", { class: "d-move", r: 7 });
  svg.replaceChildren(feedPowder, powderGroup, feedPlate, plate, ...layers, overlay, walls, roller);

  // ----- render: draw everything from S -----
  function render() {
    const plateY = TOP + T + S.drop;
    set(plate, { y: plateY });
    set(buildPowder, { x: IN_X, y: TOP + T, width: IN_W, height: Math.max(0, plateY - (TOP + T)) });

    const rollerX = ROLL_FROM + (ROLL_TO - ROLL_FROM) * S.roller;
    const coverW = S.cover ? clamp(rollerX - IN_X, 0, IN_W) : 0;
    set(newPowder, { x: IN_X, y: TOP + T * (1 - S.gap), width: coverW, height: T * S.gap });
    set(powderGroup, { opacity: 1 - S.unpack });
    set(overlay, { y: TOP + T, height: Math.max(0, plateY - (TOP + T)), opacity: 0.6 * (1 - S.unpack) });

    const sc = 1 - 0.06 * S.oven; // sintering shrinks the part a little (binder jetting)
    layers.forEach((el, k) => {
      const wf = S.f[k];
      const y0 = TOP + S.drop - T * k;
      const y = plateY - (plateY - y0) * sc;
      if (el.tagName === "g") {
        [...el.children].forEach((pillar, i) => {
          const on = i < Math.ceil(wf * 5 - 1e-6);
          set(pillar, { x: PART_X + (i * (PART_W - 6)) / 4, y, width: on ? 6 : 0 });
        });
        return;
      }
      const w = PART_W * wf * sc;
      const x = fromRight && !S.oven ? PART_X + PART_W * (1 - wf) : PART_X + (PART_W * wf - w) / 2;
      set(el, { x, y, width: w, height: (T - 1) * sc, "fill-opacity": green ? 0.4 + 0.6 * S.oven : 1 });
    });

    const feedY = 262 - 50 * S.feed;
    set(feedPlate, { y: feedY });
    set(feedPowder, { y: TOP - 4, height: Math.max(0, feedY - (TOP - 4)) });
    set(roller, { cx: rollerX, cy: TOP - 8, opacity: S.rollerOn });
    onRender();
  }

  /** static finished state, for reduced motion */
  function renderFinal() {
    Object.assign(S, { drop: T * LAYERS, unpack: 1, feed: 1, oven: green ? 1 : 0, rollerOn: 0 });
    for (let k = 0; k < LAYERS; k++) S.f[k] = 1;
    render();
  }

  /** tween numbers in S, re-rendering on each frame. `target` is S or S.f. */
  const to = (tl, target, props, duration, position, ease = "none") =>
    tl.to(target, { ...props, duration, ease, onUpdate: render }, position);

  render();
  return { svg, S, initial, zeroF, render, renderFinal, to, layers };
}
