// Step 6: take the supports off, then the finale: the object is printed again on a canvas, layer by layer,
// and turns. A slider lets you turn it by hand (also the only way to turn it with reduced motion).
// finale.js is loaded only now (dynamic import), so the rest of the site never pays for it.
import { h } from "../../dom.js";
import { svgEl } from "../../svg.js";
import { bidi } from "../../bidi.js";
import { finish, slice } from "../../../data/game.js";

export function mount(host, ctx) {
  const obj = ctx.object();
  const layer = slice.layerHeights.find((l) => l.id === ctx.state.layerId) ?? slice.layerHeights[1];
  const infill = slice.infills.find((i) => i.id === ctx.state.infillId) ?? slice.infills[1];
  const spots = obj.supports.filter((s) => ctx.state.found.includes(s.id));
  let finale = null;
  let canvas = null;
  let gone = false;
  const markers = new Map();

  // ----- 1. remove the supports: tap each one -----
  const left = () => spots.filter((s) => !ctx.state.removed.includes(s.id)).length;
  function remove(spot) {
    if (ctx.state.removed.includes(spot.id)) return;
    ctx.state.removed.push(spot.id);
    ctx.figure.removeSupport(spot.id);
    ctx.figure.addScar(spot);
    markers.get(spot.id)?.remove();
    if (left() === 0) reveal();
    else ctx.say(finish.removeLeft(left()));
  }
  for (const spot of spots) {
    if (ctx.state.removed.includes(spot.id)) continue;
    const [x, y] = spot.at;
    const g = svgEl("g", { class: "game-spot is-yes", role: "button", tabindex: "0", "aria-label": `הסרת תמיכה: ${spot.label}`, transform: `translate(${x} ${-y})` }, svgEl("circle", { class: "game-spot__hit", r: 10 }), svgEl("circle", { class: "game-spot__dot", r: 4.5 }));
    g.addEventListener("click", () => remove(spot));
    g.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), remove(spot)));
    markers.set(spot.id, g);
    ctx.figure.overlay.append(g);
  }

  // ----- 2. the finale -----
  const controls = h("div", { class: "game-finish", hidden: true });
  async function reveal() {
    ctx.say(finish.removed);
    const { createFinale } = await import("../finale.js");
    if (gone) return;
    const target = ctx.useCanvas(`${obj.name} מודפס, שכבה אחרי שכבה`);
    canvas = target;
    finale = createFinale(target.canvas, obj, { layers: layer.layers });
    const showControls = () => {
      ctx.state.finished = true;
      ctx.complete();
      finale.spin(true);
      controls.hidden = false;
      ctx.say(`${obj.finale} ${finish.summary(layer.label, infill.label)}`);
    };
    if (ctx.state.finished) { finale.showFinished(); showControls(); }
    else finale.print({ onDone: showControls });
  }

  // slider (turn by hand) and the two ways to play again
  const slider = h("input", { type: "range", min: 0, max: 360, step: 5, value: 35, "aria-label": finish.rotate });
  slider.addEventListener("input", () => {
    finale?.spin(false); // taking over: stop turning by itself
    finale?.setAngle((Number(slider.value) * Math.PI) / 180);
  });
  const again = h("button", { class: "game-btn", type: "button" }, finish.again);
  const another = h("button", { class: "game-btn", type: "button" }, finish.another);
  again.addEventListener("click", () => ctx.restart(true));
  another.addEventListener("click", () => ctx.restart(false));
  controls.append(h("label", { class: "game-finish__rotate" }, h("span", { html: bidi(finish.rotate) }), slider), h("div", { class: "game-stage__actions" }, again, another));
  host.append(controls);

  if (left() === 0) reveal();
  else ctx.say(finish.removeLeft(left()));

  return {
    destroy() {
      gone = true;
      finale?.destroy();
      canvas?.release();
    },
  };
}
