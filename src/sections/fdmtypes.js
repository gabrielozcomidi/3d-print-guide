// Section: FDM printer types. Same process (FDM), different motion systems. A selector picks one
// of six types; the panel shows an animation of the motion, what each part does, pros/cons, and
// below there is a table that compares all of them. Content: src/data/fdmTypes.js.
import "../styles/fdmtypes.css";
import { h } from "../lib/dom.js";
import { bidi } from "../lib/bidi.js";
import { sectionHeader } from "../lib/section.js";
import { dotMeter } from "../lib/meters.js";
import { selector } from "../lib/selector.js";
import { markList } from "../lib/list.js";
import { diagramFrame } from "../lib/diagramFrame.js";
import { gsap, prefersReducedMotion } from "../lib/reveal.js";
import { fdmTypes } from "../data/fdmTypes.js";
import { diagrams } from "../diagrams/index.js";

const card = (title, ...content) => h("div", { class: "card spec" }, h("h3", { class: "spec__title" }, title), ...content);
const list = markList;

/** Panel for one type. @returns {{node:HTMLElement, destroy:()=>void}} */
function buildPanel(type) {
  const animate = !prefersReducedMotion();
  const frameHost = h("div", {});
  let frame = null;

  /** Show the top-view drawing or (when the type has one) the Z-axis side view. */
  function showView(view) {
    frame?.destroy();
    const side = view === "side" && type.sideDiagram;
    frame = diagramFrame(diagrams[side ? type.sideDiagram : type.diagram], { animate, caption: side ? type.sideView : type.view });
    frameHost.replaceChildren(frame.node);
  }
  showView("top");

  const viewSwitch = type.sideDiagram
    ? selector({
        label: "זווית התצוגה",
        role: "radio",
        items: [
          { id: "top", label: "מבט מלמעלה" },
          { id: "side", label: "מבט צד" },
        ],
        selected: "top",
        onSelect: showView,
        className: "view-switch",
      })
    : null;

  const node = h(
    "div",
    { class: "tech-panel", id: "types-panel", role: "tabpanel", "aria-labelledby": `fdmtype-${type.id}`, style: "--c: var(--t-fdm)" },
    h("p", { class: "tech-panel__lead", html: bidi(type.principle) }),
    h(
      "div",
      { class: "tech-panel__top" },
      h("div", {}, viewSwitch?.node, frameHost),
      h(
        "div",
        {},
        h("h3", {}, "מה זז ומה לא"),
        h("dl", { class: "moves" }, type.moves.map((m) => h("div", {}, h("dt", { html: bidi(m.part) }), h("dd", { html: bidi(m.does) })))),
        type.note ? h("p", { class: "spec__note", html: bidi(type.note) }) : null
      )
    ),
    h(
      "div",
      { class: "specs" },
      card("מהירות יחסית", dotMeter(type.ratings.speed, 5, "מהירות")),
      card("דיוק", dotMeter(type.ratings.accuracy, 5, "דיוק")),
      card("קלות תחזוקה", dotMeter(type.ratings.upkeep, 5, "קלות תחזוקה")),
      card("צורת נפח ההדפסה", h("p", { class: "spec__value", html: bidi(type.volume) }))
    ),
    h(
      "div",
      { class: "tech-panel__lists" },
      card("יתרונות", list(type.pros, "+")),
      card("חסרונות", list(type.cons, "−")),
      card("מתאימה ל", h("p", { html: bidi(type.bestFor) }), h("p", { class: "spec__note", html: bidi(`דוגמאות: ${type.examples}`) }))
    )
  );
  return { node, destroy: () => frame?.destroy() };
}

/** Side-by-side comparison of all types. */
function buildTable() {
  const head = ["סוג", "מה זז", "נפח הדפסה", "מהירות", "דיוק", "קלות תחזוקה"];
  return h(
    "div",
    { class: "mat-table fdm-types-table" },
    h("h3", {}, "השוואה בין הסוגים"),
    h(
      "div",
      { class: "table-wrap", tabindex: "0", role: "region", "aria-label": "טבלת השוואת סוגי מדפסות" },
      h(
        "table",
        {},
        h("thead", {}, h("tr", {}, head.map((t) => h("th", { scope: "col" }, t)))),
        h(
          "tbody",
          {},
          fdmTypes.map((t) =>
            h(
              "tr",
              { style: "--c: var(--t-fdm)" },
              h("th", { scope: "row", html: bidi(t.nameLong) }),
              h("td", { html: bidi(t.short) }),
              h("td", { html: bidi(t.volume) }),
              h("td", {}, dotMeter(t.ratings.speed, 5, "מהירות", { small: true })),
              h("td", {}, dotMeter(t.ratings.accuracy, 5, "דיוק", { small: true })),
              h("td", {}, dotMeter(t.ratings.upkeep, 5, "קלות תחזוקה", { small: true }))
            )
          )
        )
      )
    ),
    h("p", { class: "spec__note" }, "הדירוגים הם ערכים אופייניים להשוואה בין הסוגים, ולא מדידות.")
  );
}

/** @param {HTMLElement} el the <section id="fdmtypes"> element */
export function render(el) {
  const stage = h("div", { class: "tech-stage" });
  let current = null;

  function show(id) {
    if (current?.id === id) return;
    current?.destroy();
    const { node, destroy } = buildPanel(fdmTypes.find((t) => t.id === id));
    stage.replaceChildren(node);
    current = { id, destroy };
    if (!prefersReducedMotion()) gsap.from(node, { opacity: 0, y: 12, duration: 0.35, ease: "power2.out" });
  }

  const tabs = selector({
    label: "סוגי מדפסות FDM",
    items: fdmTypes.map((t) => ({ id: t.id, label: t.name, color: "--t-fdm" })),
    selected: fdmTypes[0].id,
    onSelect: show,
    controls: "types-panel",
    idPrefix: "fdmtype",
    className: "tech-tabs",
  });

  el.append(...sectionHeader("fdmtypes"), tabs.node, stage, buildTable());
  show(fdmTypes[0].id);
}
