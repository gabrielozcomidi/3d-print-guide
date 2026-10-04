// Step 4: supports. Tap the spots that overhang. A real overhang gets a support column; a decoy explains why it prints fine.
// Tapping decoys counts as a miss; after 2 misses the hint is shown too. The step is done when every real overhang is found.
import { svgEl } from "../../svg.js";
import { supportsStep } from "../../../data/game.js";

export function mount(host, ctx) {
  const obj = ctx.object();
  const needed = obj.supports.filter((s) => s.needs);
  const marks = new Map();

  const tap = (spot) => {
    const g = marks.get(spot.id);
    if (spot.needs) {
      if (!ctx.state.found.includes(spot.id)) {
        ctx.state.found.push(spot.id);
        ctx.figure.addSupport(spot);
      }
      g.classList.add("is-yes");
      ctx.say(spot.why);
      if (needed.every((s) => ctx.state.found.includes(s.id))) {
        ctx.say(`${spot.why} ${supportsStep.allDone}`);
        ctx.complete();
      }
    } else {
      g.classList.add("is-no");
      ctx.say(ctx.miss() >= 2 ? `${spot.why} ${supportsStep.hint}` : spot.why);
    }
  };

  for (const spot of obj.supports) {
    const [x, y] = spot.at;
    const g = svgEl("g", { class: "game-spot", role: "button", tabindex: "0", "aria-label": spot.label, transform: `translate(${x} ${-y})` },
      svgEl("circle", { class: "game-spot__hit", r: 10 }), svgEl("circle", { class: "game-spot__dot", r: 4.5 }));
    g.classList.toggle("is-yes", spot.needs && ctx.state.found.includes(spot.id));
    g.addEventListener("click", () => tap(spot));
    g.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), tap(spot)));
    marks.set(spot.id, g);
    ctx.figure.overlay.append(g);
  }
  // re-draw supports found before (coming back to this step): the figure keeps them, so only the marks need the state
  if (needed.every((s) => ctx.state.found.includes(s.id))) ctx.say(supportsStep.allDone);
  return { destroy() {} };
}
