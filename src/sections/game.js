// Section: the "Print Day" game. A short run through one print, one small action per step (see
// docs/superpowers/specs/2026-10-04-print-day-game-design.md). This module owns the page: header, progress
// and the stage; each step's screen lives in lib/game/steps/ and is mounted into the stage.
// Wording and per-object data: src/data/game.js.
import "../styles/game.css";
import { h } from "../lib/dom.js";
import { sectionHeader } from "../lib/section.js";
import { createGame } from "../lib/game/engine.js";
import { steps as STEPS } from "../data/game.js"; // play order and step names

/** @param {HTMLElement} el the <section id="game"> element */
export function render(el) {
  const game = createGame(STEPS.map((s) => s.id));

  // progress: numbers are a real sequence here. Outlined = still ahead, filled = done or current.
  const items = STEPS.map((s, i) =>
    h("li", { class: "game-progress__item" }, h("span", { class: "game-progress__num", "aria-hidden": "true" }, String(i + 1)), h("span", { class: "game-progress__title" }, s.title))
  );
  const progress = h("ol", { class: "game-progress", "aria-label": "שלבי המשחק" }, items);

  const stage = h("div", { class: "game-stage" });
  const prompt = h("p", { class: "game-stage__prompt", "aria-live": "polite" });
  const back = h("button", { class: "game-btn", type: "button" }, "הקודם");
  const next = h("button", { class: "next-btn", type: "button" }, h("span", {}, "הבא"));
  back.addEventListener("click", () => game.back());
  next.addEventListener("click", () => game.next());

  function show({ index }) {
    items.forEach((li, i) => {
      li.classList.toggle("is-done", i < index);
      if (i === index) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
    prompt.textContent = `שלב ${index + 1} מתוך ${STEPS.length}: ${STEPS[index].title}`; // placeholder until the step screens exist
    back.disabled = index === 0;
    next.disabled = index === STEPS.length - 1;
  }
  game.onChange(show);

  stage.append(prompt, h("div", { class: "game-stage__actions" }, back, next));
  el.append(...sectionHeader("game"), progress, stage);
  show({ index: game.index });
}
