// Section: infill. Pick a pattern, drag the density, flip between layers: the drawing shows ONE layer
// from above (walls + infill) and traces it like a nozzle. Below: what the pattern is good for, a
// guide to how much infill to use, and a reminder that walls often matter more than infill.
// Content: src/data/infill.js. Pattern drawings: src/diagrams/infillDemo.js.
import "../styles/infill.css";
import { h } from "../lib/dom.js";
import { bidi, ltr } from "../lib/bidi.js";
import { svgEl } from "../lib/svg.js";
import { sectionHeader } from "../lib/section.js";
import { selector } from "../lib/selector.js";
import { dotMeter } from "../lib/meters.js";
import { markList } from "../lib/list.js";
import { callsIt } from "../lib/callsit.js";
import { createInfill } from "../diagrams/infillDemo.js";
import { link } from "../lib/router.js";
import { flowArrow } from "../lib/arrow.js";
import { links as gameLinks } from "../data/game.js";
import { patterns, infillGuide, infillNotes, wallsNote, resinNote } from "../data/infill.js";

const RATING_LABEL = { strength: "חוזק", speed: "מהירות הדפסה", material: "חיסכון בחומר", top: "תמיכה למשטח העליון" };
const card = (title, ...content) => h("div", { class: "card spec" }, h("h3", { class: "spec__title" }, title), ...content);

/** @param {HTMLElement} el the <section id="infill"> element */
export function render(el) {
  const state = { pattern: patterns[0], density: 20, layer: 0 };

  const svg = svgEl("svg", { class: "diagram__svg infill-demo", dir: "ltr" });
  const demo = createInfill(svg);
  const apply = (trace = true) => demo.set(state.pattern.id, state.density, state.layer, { trace });

  // density slider
  const valueOut = h("output", { class: "density__value", dir: "ltr" }, "20%");
  const slider = h("input", { type: "range", min: 5, max: 100, step: 5, value: 20, "aria-label": "צפיפות המילוי באחוזים" });
  slider.addEventListener("input", () => {
    state.density = Number(slider.value);
    valueOut.textContent = `${state.density}%`;
    apply(false); // live while dragging, no trace
  });
  slider.addEventListener("change", () => apply(true));
  const densityNote = h("p", { class: "spec__note" });

  const layerPick = selector({
    label: "איזו שכבה מוצגת",
    role: "radio",
    items: [0, 1, 2].map((i) => ({ id: String(i), label: `שכבה ${i + 1}` })),
    selected: "0",
    onSelect: (id) => {
      state.layer = Number(id);
      apply(true);
    },
    className: "layer-pick",
  });

  const info = h("div", { class: "infill-info" });
  function showInfo() {
    const p = state.pattern;
    densityNote.textContent = p.densityNote ?? "";
    info.replaceChildren(
      h("h3", { class: "support-info__name", html: bidi(p.name) }),
      h("p", { class: "tech-panel__lead", html: bidi(p.how) }),
      h("div", { class: "specs" }, Object.entries(p.ratings).map(([k, v]) => card(RATING_LABEL[k], dotMeter(v, 5, RATING_LABEL[k])))),
      h("p", { class: "spec__note" }, "הדירוגים הם הערכה השוואתית בין התבניות באותה צפיפות, לא מדידה."),
      h("div", { class: "tech-panel__lists" }, card("יתרונות", markList(p.pros, "+")), card("חסרונות", markList(p.cons, "−")), card("מתאים ל", h("p", { html: bidi(p.bestFor) })), p.callsIt ? callsIt(p.callsIt) : null)
    );
  }

  const tabs = selector({
    label: "תבנית מילוי",
    items: patterns.map((p) => ({ id: p.id, label: p.name })),
    selected: patterns[0].id,
    onSelect: (id) => {
      state.pattern = patterns.find((p) => p.id === id);
      showInfo();
      apply(true);
    },
    controls: "infill-panel",
    idPrefix: "infill",
    className: "type-pick",
  });

  // guide: how much infill for what, as bars on a 0-100% scale
  const guide = h(
    "div",
    { class: "infill-guide" },
    h("h3", {}, "כמה מילוי צריך?"),
    infillGuide.map((g) => {
      const bar = h("span", { class: "range__bar" });
      bar.style.insetInlineStart = `${g.from}%`;
      bar.style.inlineSize = `${Math.max(g.to - g.from, 1.5)}%`;
      return h("div", { class: "guide-row" }, h("div", { class: "guide-row__text" }, h("strong", { html: bidi(g.use) }), h("span", { html: ltr(`${g.from}–${g.to}%`) })), h("div", { class: "range__track" }, bar), h("p", { class: "spec__note", html: bidi(g.note) }));
    })
  );

  el.append(
    ...sectionHeader("infill"),
    tabs.node,
    h(
      "div",
      { id: "infill-panel", role: "tabpanel", class: "infill-stage" },
      h("div", { class: "diagram", style: "--c: var(--t-fdm)" }, svg, h("p", { class: "diagram__caption" }, "מבט מלמעלה על שכבה אחת. איור סכמטי, לא פלט מדויק של סלייסר."), h("div", { class: "density" }, h("label", {}, "צפיפות", slider, valueOut), densityNote), layerPick.node),
      info
    ),
    guide,
    h("p", { class: "spec__note infill-notes", html: bidi(infillNotes.join(" ")) }),
    h("div", { class: "infill-extras" }, h("h3", {}, "הקירות חשובים לא פחות"), h("p", { html: bidi(wallsNote) }), h("h3", {}, "ובשרף?"), h("p", { html: bidi(resinNote) })),
    // the end of the printing chapter: try it for real
    h("p", { class: "infill-game" }, link("game", { class: "next-btn" }, h("span", {}, gameLinks.chapterLink), flowArrow()))
  );
  showInfo();
  apply(true);
}
