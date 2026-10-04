// Section: supports. Pick the kind of printing (FDM / resin / metal / powder) and a support style, then
// watch it in a small demo: without supports, with supports growing layer by layer, and after removal.
// Under it: what the style is, pros and cons, when to use it, and how to avoid supports at all.
// Content: src/data/supports.js. Pictures: src/diagrams/supportsDemo.js.
import "../styles/supports.css";
import { h } from "../lib/dom.js";
import { bidi } from "../lib/bidi.js";
import { svgEl } from "../lib/svg.js";
import { sectionHeader } from "../lib/section.js";
import { selector } from "../lib/selector.js";
import { dotMeter } from "../lib/meters.js";
import { markList } from "../lib/list.js";
import { callsIt } from "../lib/callsit.js";
import { createSupportsDemo, createResinDemo } from "../diagrams/supportsDemo.js";
import { supportGroups, supportSettings, adhesion, avoidTips } from "../data/supports.js";

const MODE_LABEL = { bare: "בלי תמיכות", with: "עם תמיכות", removed: "אחרי הסרה" };
const RATING_LABEL = { material: "חיסכון בחומר", surface: "משטח נקי", removal: "קלות הסרה", setup: "פשטות ההגדרה", hold: "עוצמת האחיזה" };

const card = (title, ...content) => h("div", { class: "card spec" }, h("h3", { class: "spec__title" }, title), ...content);

/** One demo drawing for a support type; returns {node, setMode, destroy}. */
function buildDemo(type) {
  const svg = svgEl("svg", { class: "diagram__svg support-demo", dir: "ltr" });
  const demo = type.kind.startsWith("resin-") ? createResinDemo(svg, { level: type.kind.slice(6) }) : createSupportsDemo(svg, { kind: type.kind });
  const legend = h(
    "ul",
    { class: "legend" },
    h("li", { "data-kind": "fill" }, "החלק המודפס"),
    h("li", { "data-kind": "hot" }, "תמיכות"),
    h("li", { "data-kind": "line" }, "סימני הסרה")
  );
  return { node: h("div", { class: "diagram", style: "--c: var(--t-fdm)" }, svg, legend), ...demo };
}

/** @param {HTMLElement} el the <section id="supports"> element */
export function render(el) {
  const state = { group: supportGroups[0], type: supportGroups[0].types[0], mode: "with" };
  let demo = null;

  const typeHost = h("div", {});
  const demoHost = h("div", {});
  const modeHost = h("div", {});
  const infoHost = h("div", {});

  function showDemo() {
    demo?.destroy();
    demo = buildDemo(state.type);
    demoHost.replaceChildren(demo.node);
    if (!state.type.modes.includes(state.mode)) state.mode = state.type.modes[0];
    modeHost.replaceChildren(
      selector({ label: "מצב ההדגמה", role: "radio", items: state.type.modes.map((m) => ({ id: m, label: state.type.modeLabels?.[m] ?? MODE_LABEL[m] })), selected: state.mode, onSelect: (m) => { state.mode = m; demo.setMode(m); }, className: "mode-pick" }).node
    );
    demo.setMode(state.mode);
    showInfo();
  }

  function showInfo() {
    const t = state.type;
    infoHost.replaceChildren(
      h(
        "div",
        { class: "support-info" },
        h("h3", { class: "support-info__name", html: bidi(t.name) }),
        h("p", { class: "tech-panel__lead", html: bidi(t.how) }),
        t.callsIt ? callsIt(t.callsIt) : null,
        t.note ? h("p", { class: "spec__note", html: bidi(t.note) }) : null,
        t.ratings ? h("div", { class: "specs" }, Object.entries(t.ratings).map(([k, v]) => card(RATING_LABEL[k], dotMeter(v, 5, RATING_LABEL[k])))) : null,
        t.ratings ? h("p", { class: "spec__note" }, "הדירוגים הם הערכה השוואתית בין הסגנונות, לא מדידה.") : null,
        h("div", { class: "tech-panel__lists" }, card("יתרונות", markList(t.pros, "+")), card("חסרונות", markList(t.cons, "−")), card("מתאים ל", h("p", { html: bidi(t.whenToUse) }), t.needs ? h("p", { class: "spec__note", html: bidi(t.needs) }) : null))
      )
    );
  }

  function showGroup(id) {
    state.group = supportGroups.find((g) => g.id === id);
    state.type = state.group.types[0];
    if (state.group.types.length > 1) {
      typeHost.replaceChildren(
        selector({ label: "סגנון תמיכות", items: state.group.types.map((t) => ({ id: t.id, label: t.name, color: state.group.color })), selected: state.type.id, onSelect: (tid) => { const t = state.group.types.find((x) => x.id === tid); if (!t) return; state.type = t; showDemo(); }, controls: "support-panel", idPrefix: "sup", className: "type-pick" }).node
      );
    } else typeHost.replaceChildren();
    showDemo();
  }

  const groups = selector({ label: "סוג ההדפסה", role: "radio", items: supportGroups.map((g) => ({ id: g.id, label: g.label })), selected: supportGroups[0].id, onSelect: showGroup, className: "group-pick" });

  const extras = h(
    "div",
    { class: "support-extras" },
    h("h3", {}, "הגדרות שכדאי להכיר (FDM)"),
    h("dl", { class: "formats" }, supportSettings.map((s) => h("div", {}, h("dt", { html: bidi(s.name) }), h("dd", { html: bidi(s.meaning) })))),
    h("h3", {}, "אחיזה למיטה: לא תמיכות"),
    h("dl", { class: "formats" }, adhesion.map((s) => h("div", {}, h("dt", { html: bidi(s.name) }), h("dd", { html: bidi(s.meaning) })))),
    h("h3", {}, "איך מתחמקים מתמיכות"),
    markList(avoidTips, "•")
  );

  el.append(...sectionHeader("supports"), groups.node, typeHost, h("div", { id: "support-panel", role: "tabpanel", class: "support-stage" }, h("div", {}, demoHost, modeHost), infoHost), extras);
  showGroup(supportGroups[0].id);
}
