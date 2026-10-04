// Section: technologies. A tab strip picks one of the five main technologies; the panel below
// shows its process animation, the steps (highlighted in sync with the animation), and spec cards.
// All wording and numbers come from src/data/technologies.js.
import "../styles/technologies.css";
import { h } from "../lib/dom.js";
import { bidi, ltr } from "../lib/bidi.js";
import { sectionHeader } from "../lib/section.js";
import { diagramFrame } from "../lib/diagramFrame.js";
import { dotMeter, layerRange } from "../lib/meters.js";
import { gsap, prefersReducedMotion } from "../lib/reveal.js";
import { selector } from "../lib/selector.js";
import { link } from "../lib/router.js";
import { flowArrow } from "../lib/arrow.js";
import { markList } from "../lib/list.js";
import { materials } from "../data/materials.js";
import { technologies } from "../data/technologies.js";
import { diagrams } from "../diagrams/index.js";

// Industrial (metal) technologies get their own short section later; tabs are the main five.
const TABS = technologies.filter((t) => t.family !== "metal");

const SUPPORT_LABEL = { none: "לא נדרשות", needed: "נדרשות" };

/** A titled card with arbitrary content. */
const card = (title, ...content) => h("div", { class: "card spec" }, h("h3", { class: "spec__title" }, title), ...content);

/** Pros / cons / post-processing list: see lib/list.js. */
const list = markList;

/**
 * Build the panel for one technology.
 * @returns {{node: HTMLElement, destroy: () => void}} destroy() stops the animation and its scroll trigger
 */
export function buildPanel(tech) {
  const animate = !prefersReducedMotion();
  const diagramModule = diagrams[tech.diagram];

  // ----- process diagram (or a "coming soon" frame) -----
  const stepItems = tech.steps.map((s, i) =>
    h("li", { class: "step" }, h("strong", { html: bidi(s.title) }), h("span", { html: bidi(s.text) }))
  );
  const onStep = (index) =>
    stepItems.forEach((li, i) => (i === index ? li.setAttribute("aria-current", "step") : li.removeAttribute("aria-current")));
  const frame = diagramFrame(diagramModule, { animate, onStep });

  // ----- specs -----
  const specs = h(
    "div",
    { class: "specs" },
    card("עובי שכבה", layerRange(tech.layerHeightMm), h("p", { class: "spec__note", html: `${ltr(`${tech.layerHeightMm.min}–${tech.layerHeightMm.max}`)} מ״מ` })),
    card("מהירות יחסית", dotMeter(tech.speed, 5, "מהירות"), h("p", { class: "spec__note" }, "1 איטית, 5 מהירה. ערך אופייני להשוואה.")),
    card("רמת פירוט", dotMeter(tech.detail, 5, "פירוט"), h("p", { class: "spec__note" }, "1 גס, 5 עדין מאוד.")),
    card("תמיכות", h("p", { class: "spec__value" }, SUPPORT_LABEL[tech.supports]), h("p", { class: "spec__note", html: bidi(tech.supportsNote) }))
  );

  const node = h(
    "div",
    { class: "tech-panel", style: `--c: var(${tech.color})` },
    h("h3", { class: "tech-panel__name" }, h("span", { html: bidi(tech.name) }), tech.fullName ? h("small", { html: bidi(tech.fullName) }) : null), // which technology is on screen
    h("p", { class: "tech-panel__lead", html: bidi(tech.principle) }),
    // FDM printers come in six motion systems: they have their own page
    tech.id === "fdm" ? h("p", { class: "tech-panel__more" }, link("fdmtypes", { class: "next-btn" }, h("span", {}, "סוגי מדפסות FDM: מה זז ומה לא"), flowArrow())) : null,
    h(
      "div",
      { class: "tech-panel__top" },
      frame.node,
      h("div", {}, h("h3", {}, "שלבי התהליך"), h("ol", { class: "steps" }, stepItems))
    ),
    specs,
    h(
      "div",
      { class: "tech-panel__lists" },
      card("יתרונות", list(tech.pros, "+", "list--pro")),
      card("חסרונות", list(tech.cons, "−", "list--con")),
      card("אחרי ההדפסה", list(tech.postProcessing, "✓", "list--post")),
      card(
        "חומרים נפוצים",
        tech.materialIds.length
          ? list(tech.materialIds.map((id) => materials.find((m) => m.id === id).name), "•", "list--mat")
          : h("p", { html: bidi(tech.materialsNote ?? "") })
      )
    )
  );

  return {
    node,
    destroy: frame.destroy,
  };
}

/** @param {HTMLElement} el the <section id="technologies"> element */
export function render(el) {
  // one panel for the whole tab row (only one technology is rendered at a time); its label follows the selected tab
  const stage = h("div", { class: "tech-stage", id: "tech-panel", role: "tabpanel" });
  let current = null; // { id, destroy }

  function show(id) {
    if (current?.id === id) return;
    current?.destroy();
    const { node, destroy } = buildPanel(TABS.find((t) => t.id === id));
    stage.replaceChildren(node);
    stage.setAttribute("aria-labelledby", `tab-${id}`);
    current = { id, destroy };
    if (!prefersReducedMotion()) gsap.from(node, { opacity: 0, y: 12, duration: 0.35, ease: "power2.out" });
  }

  const tabs = selector({
    label: "טכנולוגיות הדפסה",
    items: TABS.map((t) => ({ id: t.id, label: t.name, color: t.color })),
    selected: TABS[0].id,
    onSelect: show,
    controls: "tech-panel",
    className: "tech-tabs",
  });

  // The troubleshooting section links each defect to its process step by asking for this technology.
  window.addEventListener("guide:show-tech", (e) => {
    if (!TABS.some((t) => t.id === e.detail.id)) return;
    tabs.setSelected(e.detail.id);
    show(e.detail.id);
  });

  el.append(...sectionHeader("technologies"), tabs.node, stage);
  show(TABS[0].id);
}
