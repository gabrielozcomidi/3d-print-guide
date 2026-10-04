/**
 * SLS, side view. A roller spreads a thin layer of powder; a laser sinters the part's cross-section
 * into it; the build plate sinks one layer; repeat. At the end the part is lifted out of the loose
 * powder (the powder fades away).  Steps (technologies.js): 0 spread, 1 sinter, 2 lower, 3 unpack.
 * dmls.js reuses this with metal supports and a sealed chamber.
 */
import { gsap } from "../lib/reveal.js";
import { svgEl } from "../lib/svg.js";
import { set } from "./kit.js";
import { createBed, LAYERS, T, TOP, PART_X, PART_W } from "./powderbed.js";

/** Legend glyph kinds are styled in technologies.css. */
export const legend = [
  { label: "חלק נע", kind: "move" },
  { label: "חלק קבוע", kind: "box" },
  { label: "אבקה", kind: "powder" },
  { label: "החלק", kind: "fill" },
  { label: "לייזר", kind: "hot" },
];

const LASER = { x: 215, y: 36 };

/**
 * @param {SVGElement} svg
 * @param {{animate:boolean, onStep?:(i:number)=>void}} ctx
 * @param {{metal?:boolean, sealed?:boolean, label?:string, legend?:object[]}} [opts] variations used by dmls.js
 */
export function createSls(svg, { animate, onStep = () => {} }, opts = {}) {
  const S_beam = { beam: 0 };
  const source = svgEl("rect", { class: "d-fixed", x: LASER.x - 14, y: LASER.y - 16, width: 28, height: 16, rx: 3 });
  const beam = svgEl("line", { class: "d-beam", x1: LASER.x, y1: LASER.y });
  const dot = svgEl("circle", { class: "d-dot", r: 3.5, cy: TOP });
  const energy = svgEl("g", {}, beam, dot);

  let bed = null; // assigned below; onRender also runs once inside createBed, before this exists
  bed = createBed(svg, {
    animate,
    metal: opts.metal,
    onRender: () => {
      if (!bed) return;
      // the laser aims at the end of the layer currently being sintered
      const x = PART_X + PART_W * bed.S.f[bed.S.cur];
      set(beam, { x2: x, y2: TOP });
      set(dot, { cx: x });
      set(energy, { opacity: S_beam.beam });
    },
  });
  svg.setAttribute("aria-label", opts.label ?? "לייזר ממזג אבקה בשכבה דקה, והפלטה יורדת ומקבלת שכבה חדשה");
  svg.append(source, energy);
  if (opts.sealed) svg.prepend(svgEl("rect", { class: "d-fixed d-back", x: 38, y: 8, width: 240, height: 272, rx: 10 }));

  const { S } = bed;
  const theLegend = opts.legend ?? legend;
  if (!animate) {
    bed.renderFinal();
    return { legend: theLegend, play() {}, pause() {}, destroy() {} };
  }

  const tl = gsap.timeline({ repeat: -1, paused: true });
  tl.set(S, bed.initial, 0);
  tl.set(S.f, bed.zeroF, 0);
  tl.set(S_beam, { beam: 0 }, 0);

  for (let i = 0; i < LAYERS; i++) {
    const first = i === 0; // the first layer is slower, so the steps can be followed
    tl.call(onStep, [0]); // 0) spread a fresh layer of powder
    tl.set(S, { cur: i, roller: 0, rollerOn: 1, cover: 1, gap: 1 });
    bed.to(tl, S, { roller: 1 }, first ? 1.1 : 0.7);

    tl.call(onStep, [1]); // 1) the laser draws the cross-section
    tl.set(S_beam, { beam: 1 });
    bed.to(tl, S.f, { [i]: 1 }, first ? 1.3 : 0.8);
    tl.set(S_beam, { beam: 0 });

    tl.call(onStep, [2]); // 2) the plate sinks one layer; the roller returns
    bed.to(tl, S, { drop: T * (i + 1), gap: 0, feed: (i + 1) / LAYERS, roller: 0 }, 0.45, undefined, "power1.inOut");
    tl.set(S, { gap: 1, cover: 0, rollerOn: 0 });
  }
  tl.call(onStep, [3]); // 3) lift the part out of the loose powder
  bed.to(tl, S, { unpack: 1 }, 1.2, undefined, "power1.inOut");
  tl.to({}, { duration: 1.2 });

  return {
    legend: theLegend,
    play() { tl.play(); },
    pause() { tl.pause(); },
    destroy() { tl.kill(); },
  };
}

export const create = (svg, ctx) => createSls(svg, ctx);
