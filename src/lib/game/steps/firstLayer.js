// Step 5: the first layer, the failure moment. Pick the nozzle height: too high and too low both fail in a visible,
// funny way with a hint, and you can try again instantly (nothing is lost). The right height unlocks the print,
// which runs layer by layer on the object.
import { h } from "../../dom.js";
import { svgEl } from "../../svg.js";
import { bidi } from "../../bidi.js";
import { selector } from "../../selector.js";
import { gsap, prefersReducedMotion } from "../../reveal.js";
import { firstLayer, slice } from "../../../data/game.js";

/** Close-up of the nozzle over the bed for one height: "high" (spaghetti), "right", "low" (squashed). */
function closeUp(kind) {
  const svg = svgEl("svg", { class: "game-first", viewBox: "0 0 160 84", role: "img", "aria-label": "הפיה מעל המיטה" });
  const tipY = { high: 38, right: 59, low: 63 }[kind]; // where the nozzle tip is (the bed line is at y=64): far, close, pressed into it
  const tipX = { high: 80, right: 70, low: 80 }[kind];
  const ink = svgEl("g", { class: "wobble" });
  ink.append(svgEl("line", { class: "fig-bed", x1: 8, y1: 64, x2: 152, y2: 64 }));
  const line = svgEl("path", { class: "game-first__line game-first__line--" + kind, d: { high: "M80 36 C60 40 100 44 70 48 S110 54 84 58 S50 56 96 62 S60 60 104 63", right: "M30 61 H110", low: "M58 62.5 H102 M52 62 q-4 0 -2 -2 M108 62 q4 0 2 -2" }[kind] });
  line.setAttribute("pathLength", "1");
  const nozzle = svgEl("g", { class: "game-first__nozzle", transform: `translate(${tipX} ${tipY - 22})` },
    svgEl("rect", { x: -9, y: 0, width: 18, height: 12, rx: 2 }), svgEl("polygon", { points: "-6,12 6,12 0,22" }), svgEl("line", { x1: 0, y1: 0, x2: 0, y2: -16 }));
  ink.append(line, nozzle);
  svg.append(ink);
  if (!prefersReducedMotion()) {
    gsap.set(line, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to(line, { strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut", onComplete: () => gsap.set(line, { strokeDasharray: "none" }) });
  }
  return svg;
}

export function mount(host, ctx) {
  const picture = h("div", { class: "game-first-wrap" });
  const start = h("button", { class: "next-btn", type: "button", hidden: true }, h("span", {}, firstLayer.start));
  const layer = slice.layerHeights.find((l) => l.id === ctx.state.layerId) ?? slice.layerHeights[1];
  let printing = false;

  const sel = selector({
    label: "גובה הפיה מעל המיטה",
    role: "radio",
    items: firstLayer.heights.map((x) => ({ id: x.id, label: x.label })),
    selected: ctx.state.printed ? "right" : null,
    onSelect(id) {
      if (printing || ctx.state.printed) return;
      const x = firstLayer.heights.find((v) => v.id === id);
      picture.replaceChildren(closeUp(id));
      if (x.result === "ok") {
        ctx.say(x.ok);
        start.hidden = false;
        start.focus();
      } else {
        start.hidden = true;
        ctx.say(ctx.miss() >= 2 ? `${x.fail} ${x.hint}` : x.fail); // after 2 failed tries the hint is added
      }
    },
  });

  start.addEventListener("click", () => {
    printing = true;
    start.hidden = true;
    sel.node.setAttribute("aria-disabled", "true");
    ctx.say(firstLayer.printing);
    ctx.figure.print(layer.layers, {
      onDone() {
        printing = false;
        ctx.state.printed = true;
        ctx.say(firstLayer.printed);
        ctx.complete();
      },
    });
  });

  host.append(sel.node, picture, h("p", {}, start));
  if (ctx.state.printed) {
    picture.replaceChildren(closeUp("right"));
    ctx.say(firstLayer.printed);
  }
  return { destroy() { printing = false; } };
}
