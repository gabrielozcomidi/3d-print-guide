// Step 3: slicing. Pick a layer height and an infill; the figure shows the slice lines live and a small
// cross-section shows the infill. There is no wrong answer: each choice trades time, finish, strength and material.
import { h } from "../../dom.js";
import { svgEl } from "../../svg.js";
import { bidi, ltr } from "../../bidi.js";
import { selector } from "../../selector.js";
import { dotMeter } from "../../meters.js";
import { slice } from "../../../data/game.js";

/** Cross-section of a printed layer: a wall and diagonal infill lines; the denser the infill, the closer the lines. */
function crossSection(pct) {
  const svg = svgEl("svg", { class: "game-infill", viewBox: "0 0 80 80", role: "img", "aria-label": `מילוי ${pct} אחוז` });
  const clip = svgEl("clipPath", { id: "game-infill-clip" }, svgEl("rect", { x: 6, y: 6, width: 68, height: 68 }));
  const lines = svgEl("g", { "clip-path": "url(#game-infill-clip)", class: "game-infill__lines" });
  const gap = 240 / pct / 2; // 10% -> 12 units apart, 40% -> 3 units apart
  for (let k = -80; k < 160; k += gap) lines.append(svgEl("line", { x1: k, y1: 0, x2: k + 80, y2: 80 }));
  svg.append(svgEl("defs", {}, clip), lines, svgEl("rect", { class: "game-infill__wall", x: 4, y: 4, width: 72, height: 72, rx: 4 }));
  return svg;
}

export function mount(host, ctx) {
  const pick = { layer: slice.layerHeights.find((l) => l.id === ctx.state.layerId), infill: slice.infills.find((i) => i.id === ctx.state.infillId) };
  const result = h("div", { class: "game-slice__result" });

  const layerSel = selector({ label: "עובי שכבה", role: "radio", items: slice.layerHeights.map((l) => ({ id: l.id, label: l.label })), selected: ctx.state.layerId, onSelect: (id) => choose("layer", id) });
  const infillSel = selector({ label: "מילוי", role: "radio", items: slice.infills.map((i) => ({ id: i.id, label: i.label })), selected: ctx.state.infillId, onSelect: (id) => choose("infill", id) });

  function choose(kind, id) {
    ctx.state.printed = false; // a different slice means a different print
    ctx.state.done.firstLayer = false;
    if (kind === "layer") { pick.layer = slice.layerHeights.find((l) => l.id === id); ctx.state.layerId = id; }
    else { pick.infill = slice.infills.find((i) => i.id === id); ctx.state.infillId = id; }
    render();
  }

  function render() {
    const { layer, infill } = pick;
    ctx.figure.showCuts(layer ? layer.layers : 0);
    const rows = [];
    if (layer) rows.push(["time", layer.time], ["finish", layer.finish]);
    if (infill) rows.push(["strength", infill.strength], ["material", infill.material]);
    result.replaceChildren(
      h("div", { class: "game-meters" }, rows.map(([k, v]) => h("div", { class: "game-meters__row" }, h("span", {}, slice.summaryLabel[k]), dotMeter(v, 3, slice.summaryLabel[k])))),
      infill ? crossSection(infill.pct) : null,
      layer ? h("p", { class: "game-slice__mm", html: `${ltr(layer.mm)} מ״מ` }) : null
    );
    ctx.say([layer?.line, infill?.line].filter(Boolean).join(" ") || slice.note);
    if (layer && infill) ctx.complete();
  }

  host.append(h("div", { class: "game-slice" }, h("h4", { class: "game-label" }, "עובי שכבה"), layerSel.node, h("h4", { class: "game-label" }, "מילוי"), infillSel.node, result));
  ctx.say(slice.note);
  render();
  return { destroy: () => ctx.figure.showCuts(0) };
}
