// Step 1: choose what to print. Three big tiles; picking one shows its outline in the figure.
import { h } from "../../dom.js";
import { bidi } from "../../bidi.js";
import { miniObject } from "../figure.js";
import { objects } from "../../../data/game.js";

/** @param {HTMLElement} host @param {object} ctx see sections/game.js */
export function mount(host, ctx) {
  const tiles = objects.map((o) => {
    const b = h("button", { class: "game-tile", type: "button", "aria-pressed": String(ctx.state.objectId === o.id) }, miniObject(o), h("strong", { class: "game-tile__name", html: bidi(o.name) }), h("span", { class: "game-tile__blurb", html: bidi(o.blurb) }));
    b.addEventListener("click", () => {
      ctx.setObject(o.id);
      tiles.forEach((t) => t.setAttribute("aria-pressed", String(t === b)));
      ctx.say(`בחרתם: ${o.name}.`);
      ctx.complete();
    });
    return b;
  });
  host.append(h("div", { class: "game-tiles" }, tiles));
  return { destroy() {} };
}
