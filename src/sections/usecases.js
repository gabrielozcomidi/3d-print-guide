// Section: use cases. Pick what you want to print; get recommended technologies and materials,
// each with a one-line "why", plus what to avoid. Content: src/data/useCases.js.
import "../styles/usecases.css";
import { h } from "../lib/dom.js";
import { bidi } from "../lib/bidi.js";
import { flowArrow } from "../lib/arrow.js";
import { sectionHeader } from "../lib/section.js";
import { selector } from "../lib/selector.js";
import { markList } from "../lib/list.js";
import { useCases } from "../data/useCases.js";
import { technologies } from "../data/technologies.js";
import { materials } from "../data/materials.js";

const techById = Object.fromEntries(technologies.map((t) => [t.id, t]));
const materialName = (id) => materials.find((m) => m.id === id)?.name;

/** One recommendation: technology -> materials, and why. */
function buildRow(rec) {
  const tech = techById[rec.techId];
  const names = rec.materialIds.map(materialName).filter(Boolean);
  return h(
    "div",
    { class: "reco" },
    h("span", { class: "chip reco__tech", style: `--c: var(${tech.color})`, html: bidi(tech.name) }),
    flowArrow(),
    h("p", { class: "reco__materials", html: bidi(names.length ? names.join(", ") : "מתכת") }),
    h("p", { class: "reco__why", html: bidi(rec.why) })
  );
}

function buildDetail(useCase) {
  return h(
    "div",
    { class: "usecase", id: "usecase-panel", role: "tabpanel", "aria-labelledby": `usecase-${useCase.id}` },
    h("p", { class: "tech-panel__lead", html: bidi(useCase.summary) }),
    h("h3", {}, "מה מתאים"),
    h("div", { class: "recos" }, useCase.recommendations.map(buildRow)),
    useCase.avoid
      ? h(
          "div",
          { class: "card avoid" },
          h("h3", { class: "spec__title" }, "פחות מתאים"),
          markList(useCase.avoid.materialIds.map(materialName).filter(Boolean), "×"),
          h("p", { class: "spec__note", html: bidi(useCase.avoid.why) })
        )
      : null
  );
}

/** @param {HTMLElement} el the <section id="usecases"> element */
export function render(el) {
  const stage = h("div", {});
  const show = (id) => stage.replaceChildren(buildDetail(useCases.find((u) => u.id === id)));

  const tabs = selector({
    label: "שימושים",
    items: useCases.map((u) => ({ id: u.id, label: u.name })),
    selected: useCases[0].id,
    onSelect: show,
    controls: "usecase-panel",
    idPrefix: "usecase",
    className: "usecase-tabs",
  });

  el.append(...sectionHeader("usecases"), tabs.node, stage);
  show(useCases[0].id);
}
