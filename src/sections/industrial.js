// Section: industrial metal printing, "for context only". Same panel as the Technologies section
// (animation, steps, specs), for the two metal technologies. Content: src/data/technologies.js.
import { h } from "../lib/dom.js";
import { sectionHeader } from "../lib/section.js";
import { selector } from "../lib/selector.js";
import { gsap, prefersReducedMotion } from "../lib/reveal.js";
import { technologies } from "../data/technologies.js";
import { buildPanel } from "./technologies.js";

const METAL = technologies.filter((t) => t.family === "metal");

/** @param {HTMLElement} el the <section id="industrial"> element */
export function render(el) {
  const stage = h("div", { class: "tech-stage", id: "industrial-panel", role: "tabpanel" });
  let current = null;

  function show(id) {
    if (current?.id === id) return;
    current?.destroy();
    const { node, destroy } = buildPanel(METAL.find((t) => t.id === id));
    stage.replaceChildren(node);
    stage.setAttribute("aria-labelledby", `tab-${id}`);
    current = { id, destroy };
    if (!prefersReducedMotion()) gsap.from(node, { opacity: 0, y: 12, duration: 0.35, ease: "power2.out" });
  }

  const tabs = selector({
    label: "טכנולוגיות מתכת תעשייתיות",
    items: METAL.map((t) => ({ id: t.id, label: t.name, color: t.color })),
    selected: METAL[0].id,
    onSelect: show,
    controls: "industrial-panel",
    className: "tech-tabs",
  });

  el.append(...sectionHeader("industrial"), tabs.node, stage);
  show(METAL[0].id);
}
