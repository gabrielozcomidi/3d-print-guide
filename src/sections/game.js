// Section: the "Print Day" game. A short run through one print, one small action per step (see
// docs/superpowers/specs/2026-10-04-print-day-game-design.md). This module owns the page: header, progress,
// the object drawing and the panel; each step's screen lives in lib/game/steps/ and is mounted into the panel.
// Wording and per-object data: src/data/game.js.
import "../styles/game.css";
import { h } from "../lib/dom.js";
import { bidi } from "../lib/bidi.js";
import { sectionHeader } from "../lib/section.js";
import { createGame } from "../lib/game/engine.js";
import { createFigure } from "../lib/game/figure.js";
import { steps as STEPS, objects, choose, repair, slice, supportsStep, firstLayer, finish } from "../data/game.js";
import * as chooseStep from "../lib/game/steps/choose.js";
import * as repairStep from "../lib/game/steps/repair.js";
import * as sliceStep from "../lib/game/steps/slice.js";
import * as supportsScreen from "../lib/game/steps/supports.js";
import * as firstLayerStep from "../lib/game/steps/firstLayer.js";
import * as finishStep from "../lib/game/steps/finish.js";

// step id -> its screen and its prompt. firstLayer and finish are built in later tasks.
const SCREENS = {
  choose: { screen: chooseStep, prompt: choose.prompt },
  repair: { screen: repairStep, prompt: repair.prompt },
  slice: { screen: sliceStep, prompt: slice.prompt },
  supports: { screen: supportsScreen, prompt: supportsStep.prompt },
  firstLayer: { screen: firstLayerStep, prompt: firstLayer.prompt },
  finish: { screen: finishStep, prompt: finish.prompt },
};

const freshState = () => ({ objectId: null, repaired: false, layerId: null, infillId: null, found: [], printed: false, removed: [], finished: false, done: {} });

/** @param {HTMLElement} el the <section id="game"> element */
export function render(el) {
  const game = createGame(STEPS.map((s) => s.id));
  let state = freshState();
  const figure = createFigure();
  let mounted = null; // { destroy }

  // progress: numbers are a real sequence here. Filled = done or current.
  const items = STEPS.map((s, i) =>
    h("li", { class: "game-progress__item" }, h("span", { class: "game-progress__num", "aria-hidden": "true" }, String(i + 1)), h("span", { class: "game-progress__title" }, s.title))
  );
  const progress = h("ol", { class: "game-progress", "aria-label": "שלבי המשחק" }, items);

  const prompt = h("h3", { class: "game-stage__prompt" });
  const body = h("div", { class: "game-stage__body" });
  const feedback = h("p", { class: "game-stage__feedback", "aria-live": "polite" });
  const back = h("button", { class: "game-btn", type: "button" }, "הקודם");
  const next = h("button", { class: "next-btn", type: "button" }, h("span", {}, "הבא"));
  back.addEventListener("click", () => game.back());
  next.addEventListener("click", () => game.next());
  const panel = h("div", { class: "game-panel" }, prompt, body, feedback, h("div", { class: "game-stage__actions" }, back, next));
  const wrap = h("div", { class: "game-figure-wrap" }, figure.svg);
  const stage = h("div", { class: "game-stage" }, wrap, panel);

  /** what a step may do: see lib/game/steps/*.js */
  const ctx = {
    state,
    figure,
    object: () => objects.find((o) => o.id === state.objectId),
    say: (text) => (feedback.textContent = text),
    miss: () => game.retry(),
    complete() {
      state.done[game.id] = true;
      refreshNav();
    },
    /** swap the drawing for a canvas (the finale); release() puts the drawing back */
    useCanvas(label) {
      const canvas = h("canvas", { class: "game-canvas", role: "img", "aria-label": label });
      figure.svg.style.display = "none";
      wrap.classList.add("is-finale");
      wrap.append(canvas);
      return { canvas, release() { canvas.remove(); figure.svg.style.display = ""; wrap.classList.remove("is-finale"); } };
    },
    /** start over; keepObject: same object, otherwise choose again */
    restart(keepObject) {
      const id = keepObject ? state.objectId : null;
      Object.assign(state, freshState(), { objectId: id });
      if (id) state.done.choose = true;
      figure.setObject(id ? ctx.object() : null);
      game.restart();
    },
    setObject(id) {
      if (id === state.objectId) return;
      // a different object: everything after "choose" starts over
      Object.assign(state, freshState(), { objectId: id });
      ctx.state = state;
      figure.setObject(ctx.object());
      refreshNav();
    },
  };

  function refreshNav() {
    const done = STEPS.filter((s) => state.done[s.id]).length;
    figure.setProgress(state.printed ? 1 : Math.min(done, STEPS.length - 1) / STEPS.length); // a finished print shows the whole part
    items.forEach((li, i) => {
      li.classList.toggle("is-done", !!state.done[STEPS[i].id]);
      if (i === game.index) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
    back.disabled = game.index === 0;
    next.disabled = game.index === STEPS.length - 1 || !state.done[game.id];
  }

  function show() {
    mounted?.destroy();
    figure.stopPrint();
    figure.clearOverlay();
    body.replaceChildren();
    feedback.textContent = "";
    const { screen, prompt: text } = SCREENS[game.id];
    prompt.innerHTML = bidi(text);
    mounted = screen.mount(body, ctx);
    refreshNav();
  }
  game.onChange(show);

  el.append(...sectionHeader("game"), progress, stage);
  show();
}
