/**
 * MJF, side view. Same powder bed as SLS, but no laser: a carriage SPRAYS a fusing agent over the
 * part's cross-section (left to right), then a LAMP passes back (right to left) and fuses only the
 * wetted powder. Steps: 0 spread, 1 spray, 2 heat, 3 next layer.
 * binder.js reuses the spray pass (binder instead of fusing agent, no lamp).
 */
import { gsap } from "../lib/reveal.js";
import { svgEl } from "../lib/svg.js";
import { set } from "./kit.js";
import { createBed, LAYERS, T, TOP, PART_X, PART_W } from "./powderbed.js";

export const legend = [
  { label: "חלק נע", kind: "move" },
  { label: "חלק קבוע", kind: "box" },
  { label: "אבקה", kind: "powder" },
  { label: "החלק", kind: "fill" },
  { label: "חומר מאחה ומנורה", kind: "hot" },
];

const CARRIAGE_Y = TOP - 30;

/**
 * @param {{lamp?:boolean, green?:boolean, label?:string, legend?:object[]}} [opts]
 *   lamp:false + green:true = binder jetting (see binder.js)
 */
export function createSprayBed(svg, { animate, onStep = () => {} }, opts = {}) {
  const lamp = opts.lamp !== false;
  const X = { spray: 0, sprayOn: 0, agentOn: 0, lamp: 0, lampOn: 0 }; // extra state for the print carriage

  // agent: wet strip drawn on the powder; sprayer: carriage with falling drops; heater: the lamp bar
  const agent = svgEl("rect", { class: "d-agent", y: TOP, height: T });
  const drops = [0, 1, 2].map((i) => svgEl("line", { class: "d-mark", x1: 4 + i * 10, x2: 4 + i * 10, y1: 12, y2: 22 }));
  const sprayer = svgEl("g", {}, svgEl("rect", { class: "d-move", width: 32, height: 12, rx: 3 }), ...drops);
  const heater = svgEl("g", {}, svgEl("rect", { class: "d-move", width: 32, height: 12, rx: 3 }), svgEl("rect", { class: "d-glow-lamp", x: 2, y: 14, width: 28, height: 6, rx: 3 }));

  let bed = null;
  bed = createBed(svg, {
    animate,
    fromRight: lamp, // the lamp moves right-to-left, so the fused layer grows from the right
    green: opts.green,
    onRender: () => {
      if (!bed) return;
      const sx = PART_X - 16 + (PART_W + 0) * X.spray;
      set(sprayer, { transform: `translate(${sx} ${CARRIAGE_Y})`, opacity: X.sprayOn });
      const lx = PART_X + PART_W * (1 - X.lamp) - 16;
      set(heater, { transform: `translate(${lx} ${CARRIAGE_Y})`, opacity: X.lampOn });
      // wet strip follows the sprayer; it disappears once the layer is fused
      set(agent, { x: PART_X, width: PART_W * X.spray, opacity: X.agentOn });
    },
  });
  svg.setAttribute("aria-label", opts.label ?? "ראש הזרקה מרסס חומר מאחה, ומנורה ממזגת את האבקה הרטובה");
  bed.layers[0].before(agent); // the wet strip sits under the fused layer, so the layer covers it as it forms
  svg.append(sprayer, heater);

  const { S } = bed;
  const theLegend = opts.legend ?? legend;
  if (!animate) {
    bed.renderFinal();
    return { legend: theLegend, play() {}, pause() {}, destroy() {} };
  }

  const tl = gsap.timeline({ repeat: -1, paused: true });
  tl.set(S, bed.initial, 0);
  tl.set(S.f, bed.zeroF, 0);
  tl.set(X, { spray: 0, sprayOn: 0, agentOn: 0, lamp: 0, lampOn: 0 }, 0);

  for (let i = 0; i < LAYERS; i++) {
    const first = i === 0;
    tl.call(onStep, [0]); // 0) spread powder
    tl.set(S, { cur: i, roller: 0, rollerOn: 1, cover: 1, gap: 1 });
    bed.to(tl, S, { roller: 1 }, first ? 1.1 : 0.7);

    tl.call(onStep, [1]); // 1) spray left to right
    tl.set(X, { spray: 0, sprayOn: 1, agentOn: 1 });
    bed.to(tl, X, { spray: 1 }, first ? 1.1 : 0.7);
    if (lamp) {
      tl.call(onStep, [2]); // 2) the lamp passes right to left and fuses the wetted powder
      tl.set(X, { sprayOn: 0, lamp: 0, lampOn: 1 });
      bed.to(tl, X, { lamp: 1 }, first ? 1.1 : 0.7);
      bed.to(tl, S.f, { [i]: 1 }, first ? 1.1 : 0.7, "<");
      tl.set(X, { lampOn: 0, agentOn: 0 });
    } else {
      // binder: the layer exists as soon as the binder has been sprayed
      bed.to(tl, S.f, { [i]: 1 }, 0.01);
      tl.set(X, { sprayOn: 0, agentOn: 0 });
    }

    tl.call(onStep, [lamp ? 3 : 2]); // next layer: the plate sinks
    bed.to(tl, S, { drop: T * (i + 1), gap: 0, feed: (i + 1) / LAYERS, roller: 0 }, 0.45, undefined, "power1.inOut");
    tl.set(S, { gap: 1, cover: 0, rollerOn: 0 });
  }
  bed.to(tl, S, { unpack: 1 }, 1.1, undefined, "power1.inOut");
  if (opts.green) {
    tl.call(onStep, [3]); // binder jetting: the fragile "green" part goes into a furnace and shrinks
    bed.to(tl, S, { oven: 1 }, 1.6, undefined, "power1.inOut");
  }
  tl.to({}, { duration: 1.2 });

  return {
    legend: theLegend,
    play() { tl.play(); },
    pause() { tl.pause(); },
    destroy() { tl.kill(); },
  };
}

export const create = (svg, ctx) => createSprayBed(svg, ctx);
