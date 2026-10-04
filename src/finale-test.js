// Dev-only page (finale.html): draws the finale for every object so the look can be checked, with buttons for
// layer count, print, spin. Not part of the production build (see vite.config.js: only index.html is built).
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/game.css";
import { h } from "./lib/dom.js";
import { objects } from "./data/game.js";
import { createFinale } from "./lib/game/finale.js";

const root = document.getElementById("root");
let layers = 60;
const grid = h("div", { style: "display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:2rem" });
let finales = [];

function build() {
  finales.forEach((f) => f.destroy());
  grid.replaceChildren();
  finales = objects.map((o) => {
    const canvas = h("canvas", { style: "width:100%;aspect-ratio:1/1;display:block", "aria-label": o.name, role: "img" });
    grid.append(h("figure", { style: "margin:0" }, canvas, h("figcaption", {}, o.name)));
    return createFinale(canvas, o, { layers });
  });
}
const btn = (label, fn) => { const b = h("button", { class: "game-btn", type: "button" }, label); b.addEventListener("click", fn); return b; };
root.append(
  h("div", { style: "display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:2rem" },
    ...[36, 60, 96].map((n) => btn(`${n} layers`, () => { layers = n; build(); })),
    btn("print", () => finales.forEach((f) => f.print({ onDone: () => f.spin(true) }))),
    btn("spin", () => finales.forEach((f) => f.spin(true))),
    btn("stop", () => finales.forEach((f) => f.spin(false))),
    btn("benchmark", () => {
      const out = finales.map((f, i) => { const t0 = performance.now(); for (let k = 0; k < 30; k++) f.setAngle(k * 0.1); return `${objects[i].id}: ${((performance.now() - t0) / 30).toFixed(1)} ms/frame`; });
      document.getElementById("bench").textContent = out.join("  |  ");
    })
  ),
  h("p", { id: "bench" }),
  grid
);
build();
