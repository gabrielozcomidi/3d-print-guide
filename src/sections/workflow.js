// Section: from model to print. Pick FDM / resin / powder, then click through the seven stages. Each
// stage shows a hand-drawn picture (draws itself in), what happens, and the tools, formats or code
// that belong to it. Below: the common slicers (see buildSlicers). Content: data/workflow.js, data/slicers.js.
import "../styles/workflow.css";
import { h } from "../lib/dom.js";
import { bidi } from "../lib/bidi.js";
import { sectionHeader } from "../lib/section.js";
import { selector } from "../lib/selector.js";
import { go } from "../lib/router.js";
import { workflowArt, drawIn } from "../diagrams/workflow.js";
import { stages, families } from "../data/workflow.js";
import { issues } from "../data/issues.js";
import { slicers, featureColumns, licenseLabel, industrialNote } from "../data/slicers.js";
import { flowArrow } from "../lib/arrow.js";
import { markList } from "../lib/list.js";

/** Which text applies for the chosen printing family. */
const textFor = (stage, family) => stage[family] ?? stage.text;

/** Inline list of English tool names (no punctuation between them: commas would scramble in RTL). */
const tags = (items) => h("ul", { class: "tags" }, items.map((t) => h("li", { html: bidi(t) })));

/** File formats: name + what it contains. */
const formatList = (formats) =>
  formats ? h("dl", { class: "formats" }, formats.map((f) => h("div", {}, h("dt", { dir: "ltr", html: bidi(f.name) }), h("dd", { html: bidi(f.meaning) })))) : null;

function buildStage(stage, index, family, goNext) {
  const art = workflowArt(stage.art, stage.title);
  const issue = stage.issueLink ? issues.find((i) => i.id === stage.issueLink) : null;

  const seeAlso = issue
    ? (() => {
        const link = h("button", { class: "link-btn", type: "button", html: bidi(issue.name) });
        link.addEventListener("click", () => go("troubleshooting"));
        return h("p", { class: "spec__note" }, "ראו גם: ", link);
      })()
    : null;

  const node = h(
    "div",
    { class: "stage", id: "workflow-panel", role: "tabpanel", "aria-labelledby": `wf-${stage.id}`, style: "--c: var(--t-fdm)" },
    h("div", { class: "stage__art" }, art),
    h(
      "div",
      { class: "stage__text" },
      h("h3", { html: bidi(`${index + 1}. ${stage.title}`) }),
      h("p", { class: "tech-panel__lead", html: bidi(textFor(stage, family)) }),
      family === "fdm" && stage.code
        ? h(
            "dl",
            { class: "gcode" },
            stage.code.map((c) => h("div", {}, h("dt", { dir: "ltr" }, c.line), h("dd", { html: bidi(c.meaning) })))
          )
        : null,
      family === "fdm" && stage.codeNote ? h("p", { class: "spec__note", html: bidi(stage.codeNote) }) : null,
      formatList(family === "resin" && stage.formatsResin ? stage.formatsResin : stage.formats),
      ...(stage.toolGroups ?? []).map((g) => h("div", { class: "toolgroup" }, h("h4", {}, g.label), tags(g.items))),
      seeAlso,
      goNext ? h("p", {}, (() => { const b = h("button", { class: "link-btn", type: "button" }, "לשלב הבא"); b.addEventListener("click", goNext); return b; })()) : null
    )
  );
  drawIn(art);
  return node;
}

// ---------------------------------------------------------------- slicers

const TRI = { yes: { n: 2, label: "כן" }, partial: { n: 1, label: "חלקי" }, no: { n: 0, label: "לא" } };
/** yes / partial / no as two dots: both filled, one filled, none (the meaning is also in the label). */
const triState = (value, feature) =>
  h("span", { class: "dots dots--sm", role: "img", "aria-label": `${feature}: ${TRI[value].label}` }, [0, 1].map((i) => h("span", { class: i < TRI[value].n ? "dot dot--on" : "dot" })));

/** The open-source family tree: each slicer here was started from the previous one. */
function lineage() {
  const chain = ["Slic3r", "PrusaSlicer", "Bambu Studio", "OrcaSlicer"];
  const parts = chain.flatMap((name, i) => [h("span", { class: "lineage__name", html: bidi(name) }), i < chain.length - 1 ? flowArrow() : null]).filter(Boolean);
  return h(
    "div",
    { class: "lineage" },
    h("h3", { class: "spec__title" }, "שושלת הסלייסרים בקוד פתוח"),
    h("div", { class: "lineage__row" }, parts),
    h("p", { class: "spec__note" }, "כל אחד התחיל מהקודם. Cura פותח בנפרד, ולכן הוא לא בשושלת.")
  );
}

function slicerTable() {
  const rows = slicers.filter((s) => s.group === "fdm");
  return h(
    "div",
    { class: "mat-table slicer-table" },
    h(
      "div",
      { class: "table-wrap", tabindex: "0", role: "region", "aria-label": "טבלת השוואת סלייסרים" },
      h(
        "table",
        {},
        h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Slicer"), featureColumns.map((c) => h("th", { scope: "col", html: bidi(c.label) })))),
        h("tbody", {}, rows.map((s) => h("tr", { style: "--c: var(--accent)" }, h("th", { scope: "row", html: bidi(s.name) }), featureColumns.map((c) => h("td", {}, triState(s.features[c.key], c.label))))))
      )
    ),
    h("p", { class: "spec__note" }, "שתי נקודות מלאות: יש. אחת: חלקי. אפס: אין. הפרטים בכרטיסים שמתחת.")
  );
}

function slicerCard(s) {
  const license = licenseLabel[s.license] + (s.licenseNote ? ` (${s.licenseNote})` : "");
  return h(
    "div",
    { class: "card slicer" },
    h("h3", { class: "slicer__name", html: bidi(s.name) }),
    h("p", { class: "spec__note", html: bidi(`${s.maker} · ${license}`.replace(" · ", ", ")) }),
    h("p", { class: "spec__note", html: bidi(`פלטפורמות: ${s.platforms}`) }),
    s.lineage ? h("p", { class: "spec__note", html: bidi(s.lineage) }) : null,
    markList(s.knownFor, "•"),
    s.featureNotes ? h("p", { class: "spec__note", html: bidi(s.featureNotes) }) : null,
    s.output ? h("div", { class: "toolgroup" }, h("h4", {}, "קבצי פלט"), h("ul", { class: "tags" }, s.output.map((o) => h("li", { dir: "ltr", html: bidi(o) })))) : null,
    h("p", { class: "spec__note" }, `מתאים ל: ${s.suits}`)
  );
}

function buildSlicers() {
  const host = h("div", { class: "slicers-host" });
  const show = (group) => {
    host.replaceChildren(
      ...(group === "fdm" ? [lineage(), slicerTable()] : []),
      h("div", { class: "slicer-grid" }, slicers.filter((s) => s.group === group).map(slicerCard)),
      group === "resin" ? h("p", { class: "spec__note", html: bidi(industrialNote) }) : null
    );
  };
  const pick = selector({
    label: "סוג סלייסר",
    role: "radio",
    items: [
      { id: "fdm", label: "FDM" },
      { id: "resin", label: "שרף" },
    ],
    selected: "fdm",
    onSelect: show,
    className: "family-pick",
  });
  show("fdm");
  return h("div", { class: "slicers" }, h("h3", { class: "slicers__title" }, "הסלייסרים הנפוצים"), h("p", { class: "section__intro" }, "כולם עושים את אותו דבר, כמו בשלב 3. ההבדלים הם בכלים, בפרופילים ובמה שהם מתמחים בו."), pick.node, host);
}

/** @param {HTMLElement} el the <section id="workflow"> element */
export function render(el) {
  const state = { stage: 0, family: "fdm" };
  const stageHost = h("div", {});

  const stageTabs = selector({
    label: "שלבי ההדפסה",
    items: stages.map((s, i) => ({ id: s.id, label: `${i + 1} ${s.short}` })),
    selected: stages[0].id,
    onSelect: (id) => {
      state.stage = stages.findIndex((s) => s.id === id);
      show();
    },
    controls: "workflow-panel",
    idPrefix: "wf",
    className: "stage-tabs",
  });

  function show() {
    const next = state.stage < stages.length - 1 ? () => { state.stage += 1; stageTabs.setSelected(stages[state.stage].id); show(); } : null;
    stageHost.replaceChildren(buildStage(stages[state.stage], state.stage, state.family, next));
  }

  const familyPick = selector({
    label: "סוג ההדפסה",
    role: "radio",
    items: families,
    selected: "fdm",
    onSelect: (id) => {
      state.family = id;
      show();
    },
    className: "family-pick",
  });

  el.append(...sectionHeader("workflow"), familyPick.node, stageTabs.node, stageHost, buildSlicers());
  show();
}
