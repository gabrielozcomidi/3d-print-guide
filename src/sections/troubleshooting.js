// Section: troubleshooting. Pick a technology group -> gallery of defect pictures -> pick one for the
// mechanism (linked back to the process step), causes ranked most likely first (each with how to
// check and how to fix), prevention, and materials that are prone to it. Content: data/issues.js.
import "../styles/troubleshooting.css";
import { h } from "../lib/dom.js";
import { bidi } from "../lib/bidi.js";
import { sectionHeader } from "../lib/section.js";
import { selector } from "../lib/selector.js";
import { go } from "../lib/router.js";
import { markList } from "../lib/list.js";
import { dotMeter } from "../lib/meters.js";
import { defectArt } from "../diagrams/defects.js";
import { issues } from "../data/issues.js";
import { materials } from "../data/materials.js";
import { technologies } from "../data/technologies.js";

// Technology groups shown as tabs. An issue belongs to a group when one of its techIds is in it.
const GROUPS = [
  { id: "fdm", label: "FDM/FFF", color: "--t-fdm", techIds: ["fdm"] },
  { id: "resin", label: "שרף (SLA/MSLA)", color: "--t-sla", techIds: ["sla", "msla"] },
  { id: "powder", label: "אבקה (SLS/MJF)", color: "--t-sls", techIds: ["sls", "mjf"] },
];
const LIKELIHOOD = {
  high: { label: "סבירה מאוד", n: 3 },
  med: { label: "סבירה", n: 2 },
  low: { label: "פחות סבירה", n: 1 },
};
const techById = Object.fromEntries(technologies.map((t) => [t.id, t]));
const issuesOf = (group) => issues.filter((i) => i.techIds.some((t) => group.techIds.includes(t)));

/** Ask the technologies section to show a technology, then scroll to it. */
function showInTechnologies(techId) {
  window.dispatchEvent(new CustomEvent("guide:show-tech", { detail: { id: techId } }));
  go("technologies");
}

/** One expandable cause: what, how to check, what to do. */
function buildCause(c, open) {
  const lk = LIKELIHOOD[c.likelihood];
  return h(
    "details",
    { class: "cause", open },
    h(
      "summary",
      {},
      h("strong", { html: bidi(c.cause) }),
      h("span", { class: "cause__likelihood" }, h("span", {}, lk.label), dotMeter(lk.n, 3, "סבירות", { small: true }))
    ),
    h(
      "div",
      { class: "cause__body" },
      h("h4", {}, "איך בודקים"),
      h("p", { html: bidi(c.check) }),
      h("h4", {}, "מה עושים"),
      markList(c.fix, "✓")
    )
  );
}

/** Everything about one issue. */
function buildDetail(issue) {
  const ref = issue.stepRef;
  const refTech = ref && techById[ref.tech];
  const proneMaterials = issue.materialIds.map((id) => materials.find((m) => m.id === id)?.name).filter(Boolean);

  return h(
    "div",
    { class: "issue", style: `--c: var(${techById[issue.techIds[0]].color})` },
    h(
      "div",
      { class: "issue__top" },
      h("div", { class: "issue__art" }, defectArt(issue.visual, `${issue.name}: ${issue.nameHe}`)),
      h(
        "div",
        { class: "issue__text" },
        h("h3", { class: "issue__name", html: bidi(issue.name) }),
        h("p", { class: "issue__he", html: bidi(issue.nameHe) }),
        h("p", { class: "spec__note" }, "כמה זה מקלקל הדפסה ", dotMeter(issue.severity, 3, "חומרה", { small: true })),
        h("h3", {}, "למה זה קורה"),
        h("p", { html: bidi(issue.mechanism) }),
        ref
          ? (() => {
              const link = h("button", { class: "link-btn", type: "button", html: bidi(`לשלב «${refTech.steps[ref.step].title}» בתהליך ${refTech.name}`) });
              link.addEventListener("click", () => showInTechnologies(ref.tech));
              return h("p", { class: "spec__note" }, "קשור ל", link);
            })()
          : null
      )
    ),
    h("h3", { class: "issue__heading" }, "סיבות אפשריות, מהסבירה ביותר"),
    h("p", { class: "spec__note" }, "בדקו לפי הסדר: הסיבה הראשונה היא הנפוצה ביותר."),
    h("div", { class: "causes" }, issue.causes.map((c, i) => buildCause(c, i === 0))),
    h(
      "div",
      { class: "tech-panel__lists" },
      h("div", { class: "card" }, h("h3", { class: "spec__title" }, "איך מונעים"), markList(issue.prevention, "•")),
      proneMaterials.length
        ? h("div", { class: "card" }, h("h3", { class: "spec__title" }, "חומרים שנוטים לזה"), markList(proneMaterials, "•"))
        : null
    )
  );
}

/** Group picker + gallery + detail. */
function buildExplorer() {
  const grid = h("div", { class: "mat-grid" });
  const detail = h("div", { "aria-live": "polite" });
  const panel = h("div", { id: "issues-panel", role: "tabpanel" }, grid, detail);
  let tiles = [];
  let groupId = null;

  function selectIssue(issue) {
    tiles.forEach((t) => t.button.setAttribute("aria-pressed", String(t.id === issue.id)));
    detail.replaceChildren(buildDetail(issue));
  }

  function showGroup(id) {
    if (groupId === id) return;
    groupId = id;
    const list = issuesOf(GROUPS.find((g) => g.id === id));
    tiles = list.map((issue) => {
      const button = h(
        "button",
        { class: "mat-tile issue-tile", type: "button", "aria-pressed": "false", style: `--c: var(${techById[issue.techIds[0]].color})` },
        defectArt(issue.visual, ""), // decorative here: the name below is the label
        h("span", { class: "mat-tile__name", html: bidi(issue.name) }),
        h("span", { class: "tile-sub", html: bidi(issue.nameHe) })
      );
      button.querySelector("svg").setAttribute("aria-hidden", "true");
      button.addEventListener("click", () => selectIssue(issue));
      return { id: issue.id, button };
    });
    grid.replaceChildren(...tiles.map((t) => t.button));
    selectIssue(list[0]);
  }

  const tabs = selector({
    label: "טכנולוגיה",
    items: GROUPS,
    selected: GROUPS[0].id,
    onSelect: showGroup,
    controls: "issues-panel",
    idPrefix: "issuegrp",
  });
  showGroup(GROUPS[0].id);
  return [tabs.node, panel];
}

/** @param {HTMLElement} el the <section id="troubleshooting"> element */
export function render(el) {
  el.append(...sectionHeader("troubleshooting"), ...buildExplorer());
}
