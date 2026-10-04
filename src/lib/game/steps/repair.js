// Step 2: the mesh has a hole. Tap it. Tapping elsewhere is a "miss"; after 2 misses the marker pulses and a hint shows.
import { svgEl } from "../../svg.js";
import { repair } from "../../../data/game.js";

export function mount(host, ctx) {
  const obj = ctx.object();
  const [x, y] = obj.hole.at;
  const fixed = ctx.state.repaired;

  // the marker is a real button (keyboard: Tab to it, Enter or Space), the big transparent circle is the tap target
  const marker = svgEl("g", { class: "game-hole" + (fixed ? " is-fixed" : ""), role: "button", tabindex: "0", "aria-label": `חור ברשת ${obj.hole.where}`, transform: `translate(${x} ${-y})` },
    svgEl("circle", { class: "game-hole__hit", r: 11 }), svgEl("circle", { class: "game-hole__ring", r: 6 }));
  ctx.figure.overlay.append(marker);

  function patch() {
    if (ctx.state.repaired) return;
    ctx.state.repaired = true;
    marker.classList.add("is-fixed");
    ctx.say(repair.done);
    ctx.complete();
  }
  const onMarker = (e) => { e.stopPropagation(); patch(); };
  marker.addEventListener("click", onMarker);
  marker.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), patch()));

  // a tap on the model but not on the hole
  const onMiss = () => {
    if (ctx.state.repaired) return;
    if (ctx.miss() >= 2) {
      marker.classList.add("is-hinted");
      ctx.say(repair.hint);
    }
  };
  ctx.figure.svg.addEventListener("click", onMiss);

  if (fixed) ctx.say(repair.done);
  return { destroy: () => ctx.figure.svg.removeEventListener("click", onMiss) };
}
