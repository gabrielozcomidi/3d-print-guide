// Section: the "what should I use?" wizard. Four questions (data/wizard.js); when all are answered the
// recommendation appears below, with an explanation built from the answers that led to it.
// Scoring lives in lib/recommend.js (pure functions, checked by scripts/check-wizard.js).
import "../styles/wizard.css";
import { h } from "../lib/dom.js";
import { bidi } from "../lib/bidi.js";
import { sectionHeader } from "../lib/section.js";
import { selector } from "../lib/selector.js";
import { go } from "../lib/router.js";
import { prefersReducedMotion } from "../lib/reveal.js";
import { markList } from "../lib/list.js";
import { recommend } from "../lib/recommend.js";
import { wizard } from "../data/wizard.js";

/** Technology + material, as one line: hollow dot in the technology colour, then the names. */
const pairLine = (r, big = false) =>
  h(
    "p",
    { class: big ? "pair pair--big" : "pair", style: `--c: var(${r.tech.color})` },
    h("span", { class: "chip", html: bidi(r.tech.name) }),
    h("span", { class: "pair__material", html: bidi(r.material.name) })
  );

/** Ask the technologies section to show a technology, then scroll to it. */
function showTech(techId) {
  window.dispatchEvent(new CustomEvent("guide:show-tech", { detail: { id: techId } }));
  go("technologies");
}

function buildResult(r, onReset) {
  const more = h("button", { class: "link-btn", type: "button", html: bidi(`איך עובדת ${r.tech.name}`) });
  more.addEventListener("click", () => showTech(r.tech.id));
  const reset = h("button", { class: "link-btn", type: "button" }, "להתחיל מחדש");
  reset.addEventListener("click", onReset);

  return h(
    "div",
    { class: "result", tabindex: "-1" },
    h("h3", {}, "ההמלצה"),
    pairLine(r, true),
    h("p", { html: bidi(r.material.summary) }),
    r.reasons.length ? h("div", { class: "card" }, h("h3", { class: "spec__title" }, "למה זה מתאים"), markList(r.reasons, "•")) : null,
    r.runnerUp
      ? h("div", { class: "card" }, h("h3", { class: "spec__title" }, "אפשרות שנייה"), pairLine(r.runnerUp))
      : null,
    h("p", { class: "result__actions" }, more, reset)
  );
}

/** @param {HTMLElement} el the <section id="wizard"> element */
export function render(el) {
  const answers = {};
  const result = h("div", { class: "result-host", "aria-live": "polite" });
  const pickers = [];

  function update() {
    if (wizard.questions.some((q) => !answers[q.id])) {
      result.replaceChildren();
      return;
    }
    const node = buildResult(recommend(answers), reset);
    result.replaceChildren(node);
    // only move the view when the user just finished the last question
    node.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "nearest" });
  }

  function reset() {
    for (const key of Object.keys(answers)) delete answers[key];
    pickers.forEach((p) => p.clear());
    result.replaceChildren();
    el.querySelector(".wizard-q")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  }

  const questions = wizard.questions.map((q, i) => {
    const picker = selector({
      label: q.text,
      role: "radio",
      items: q.options.map((o) => ({ id: o.id, label: o.label })),
      selected: null,
      onSelect: (id) => {
        answers[q.id] = id;
        update();
      },
    });
    pickers.push({ clear: () => picker.setSelected(null) });
    // a sequence of questions, so numbering is meaningful here
    return h("div", { class: "wizard-q" }, h("h3", { html: bidi(`${i + 1}. ${q.text}`) }), picker.node);
  });

  el.append(...sectionHeader("wizard"), ...questions, result);
}
