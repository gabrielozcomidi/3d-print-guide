// Section: materials. Pick a family -> a grid of small radar charts -> pick one for the big radar
// and details. Below: a sortable, filterable comparison table of every material.
// All content comes from src/data/materials.js (ratings, safety, summaries).
import "../styles/materials.css";
import { h } from "../lib/dom.js";
import { bidi } from "../lib/bidi.js";
import { sectionHeader } from "../lib/section.js";
import { radar } from "../lib/radar.js";
import { selector } from "../lib/selector.js";
import { dotMeter } from "../lib/meters.js";
import { markList } from "../lib/list.js";
import { materials } from "../data/materials.js";
import { technologies } from "../data/technologies.js";
import { issues } from "../data/issues.js";

// Radar axes / table rating columns, in order. `key` matches materials.js -> ratings.
const AXES = [
  { key: "strength", label: "חוזק" },
  { key: "flexibility", label: "גמישות" },
  { key: "heat", label: "עמידות לחום" },
  { key: "uv", label: "עמידות ל־UV" },
  { key: "easeOfPrint", label: "קלות הדפסה" },
];
const FAMILIES = [
  { id: "filament", label: "פילמנט", color: "--t-fdm" },
  { id: "resin", label: "שרף", color: "--t-sla" },
  { id: "powder", label: "אבקה", color: "--t-sls" },
];
const FAMILY_LABEL = Object.fromEntries(FAMILIES.map((f) => [f.id, f.label]));
const SAFETY = { low: { label: "נמוך", n: 1 }, med: { label: "בינוני", n: 2 }, high: { label: "גבוה", n: 3 } };

const techById = Object.fromEntries(technologies.map((t) => [t.id, t]));
const techNames = (m) => m.techIds.map((id) => techById[id].name);

// Every material gets its own colour so several can be laid over each other in the radar.
// The colour is its position inside its family (--m-1 ... --m-8, see tokens.css): materials are only
// compared within one family, so the colours only need to differ there.
const materialColor = (m) => `--m-${materials.filter((x) => x.family === m.family).indexOf(m) + 1}`;
const colorOf = materialColor;
const seriesOf = (m) => ({ id: m.id, name: m.name, color: materialColor(m), values: AXES.map((a) => m.ratings[a.key]) });

/** Text for one material: summary, safety, technologies, typical failures. */
function buildText(m) {
  const failures = (m.failureRisk ?? []).map((id) => issues.find((i) => i.id === id)?.name).filter(Boolean);
  const safety = SAFETY[m.safety.level];
  return h(
    "div",
    { class: "mat-detail__text", style: `--c: var(${materialColor(m)})` },
    h("h3", { class: "mat-detail__name", html: bidi(m.name) }),
    h("p", { html: bidi(m.summary) }),
    h(
      "div",
      { class: "card", style: "--c: var(--accent)" }, // safety is not a technology: dots use ink, not a tech colour
      h("h3", { class: "spec__title" }, "רמת זהירות בטיפול"),
      h("p", { class: "spec__value" }, safety.label),
      dotMeter(safety.n, 3, "רמת זהירות"),
      h("p", { class: "spec__note", html: bidi(m.safety.notes) })
    ),
    h(
      "div",
      { class: "card" },
      h("h3", { class: "spec__title" }, "מודפס בטכנולוגיות"),
      h("p", { class: "mat-techs" }, m.techIds.map((id) => h("span", { class: "chip", style: `--c: var(${techById[id].color})`, html: bidi(techById[id].name) })))
    ),
    failures.length ? h("div", { class: "card" }, h("h3", { class: "spec__title" }, "נוטה לתקלות"), markList(failures, "•")) : null
  );
}

/**
 * Family picker + grid of small radars + one big radar.
 * Tiles are toggles: pick one material, or several to lay them over each other in the big radar.
 * The legend under the big radar says which colour is which; choosing a name there (or the material
 * you picked last) decides whose details are shown next to the chart.
 */
function buildExplorer() {
  const grid = h("div", { class: "mat-grid" });
  const hint = h("p", { class: "mat-hint" }, "אפשר לבחור כמה חומרים כדי להשוות ביניהם. אפשר לראות אותם זה על גבי זה, בצבעים שקופים, או כל אחד בנפרד.");
  const chartHost = h("div", { class: "mat-detail__chart" });
  const multi = h("div", { class: "mat-multi" }); // "side by side" view: one radar per chosen material
  const textHost = h("div", { class: "mat-detail__host", "aria-live": "polite" });
  const detail = h("div", { class: "mat-detail" }, h("div", { class: "mat-detail__left" }, chartHost), textHost);
  // overlay: all chosen materials in one chart. separate: one chart each, next to each other.
  let mode = "overlay";
  const modePick = selector({
    label: "אופן ההשוואה",
    role: "radio",
    className: "mat-mode",
    items: [{ id: "overlay", label: "זה על גבי זה" }, { id: "separate", label: "זה לצד זה" }],
    selected: mode,
    onSelect: (id) => { mode = id; refresh(); },
  });
  const panel = h("div", { id: "materials-panel", role: "tabpanel" }, grid, hint, modePick.node, detail);

  let family = null;
  let list = []; // materials of the current family
  let picked = []; // ids, in the order they were picked
  let focus = null; // id whose details are shown
  let tiles = [];
  let big = null; // the one big radar, kept so shapes morph instead of being redrawn
  let legend = null;

  function refresh() {
    const chosen = picked.map((id) => list.find((m) => m.id === id));
    tiles.forEach((t) => t.button.setAttribute("aria-pressed", String(picked.includes(t.id))));
    const series = chosen.map(seriesOf);
    if (!big) {
      big = radar({ axes: AXES.map((a) => a.label), series, animateIn: true });
      chartHost.prepend(big, multi);
    } else big.update(series);

    const separate = mode === "separate";
    big.style.display = separate ? "none" : "";
    multi.hidden = !separate;
    detail.classList.toggle("mat-detail--separate", separate);
    multi.replaceChildren(...(separate ? chosen.map((m) => h("figure", { class: "mat-multi__item", style: `--c: var(${materialColor(m)})` }, radar({ axes: AXES.map((a) => a.label), series: [seriesOf(m)] }), h("figcaption", { class: "mat-multi__name", html: bidi(m.name) }))) : []));

    // legend: only worth showing when there is something to tell apart
    legend?.node.remove();
    legend = selector({
      label: "החומרים בהשוואה: בחירה מציגה את הפרטים שלו",
      role: "radio",
      className: "mat-legend",
      items: chosen.map((m) => ({ id: m.id, label: m.name, color: materialColor(m) })),
      selected: focus,
      onSelect: (id) => { focus = id; refresh(); },
    });
    chartHost.append(legend.node);
    textHost.replaceChildren(buildText(list.find((m) => m.id === focus)));
  }

  function toggle(m) {
    if (picked.includes(m.id)) {
      if (picked.length === 1) return; // the chart always shows at least one material
      picked = picked.filter((id) => id !== m.id);
      if (focus === m.id) focus = picked[picked.length - 1];
    } else {
      picked.push(m.id);
      focus = m.id;
    }
    refresh();
  }

  function showFamily(id) {
    if (family === id) return;
    family = id;
    list = materials.filter((m) => m.family === id);
    tiles = list.map((m) => {
      const button = h(
        "button",
        { class: "mat-tile", type: "button", "aria-pressed": "false", style: `--c: var(${materialColor(m)})` },
        radar({ axes: AXES.map((a) => a.label), series: [seriesOf(m)], labels: false }),
        h("span", { class: "mat-tile__name", html: bidi(m.name) })
      );
      button.addEventListener("click", () => toggle(m));
      return { id: m.id, button };
    });
    grid.replaceChildren(...tiles.map((t) => t.button));
    picked = [list[0].id];
    focus = list[0].id;
    refresh();
  }

  const tabs = selector({
    label: "משפחת חומרים",
    items: FAMILIES,
    selected: FAMILIES[0].id,
    onSelect: showFamily,
    controls: "materials-panel",
    idPrefix: "matfam",
  });
  showFamily(FAMILIES[0].id);
  return [tabs.node, panel];
}

/** Sortable + filterable comparison table. */
function buildTable() {
  const state = { family: "all", prop: "", min: 3, sortId: null, dir: 1 };

  const columns = [
    { id: "name", label: "חומר", value: (m) => m.name, text: true },
    { id: "family", label: "משפחה", value: (m) => FAMILY_LABEL[m.family], text: true },
    { id: "techs", label: "טכנולוגיות", value: (m) => techNames(m).join(", "), text: true },
    ...AXES.map((a) => ({ id: a.key, label: a.label, value: (m) => m.ratings[a.key] })),
    { id: "safety", label: "זהירות בטיפול", value: (m) => SAFETY[m.safety.level].n },
  ];

  const count = h("p", { class: "table-count", "aria-live": "polite" });
  const tbody = h("tbody");
  const headers = columns.map((c) => {
    const btn = h("button", { class: "sort-btn", type: "button", html: bidi(c.label) });
    btn.addEventListener("click", () => {
      // 1st click: best first (numbers) / A-Z (text); 2nd: reversed; 3rd: back to data order
      if (state.sortId !== c.id) { state.sortId = c.id; state.dir = c.text ? 1 : -1; }
      else if (state.dir === (c.text ? 1 : -1)) state.dir = -state.dir;
      else state.sortId = null;
      update();
    });
    return { c, th: h("th", { scope: "col", "aria-sort": "none" }, btn) };
  });

  function rows() {
    let list = materials.filter((m) => state.family === "all" || m.family === state.family);
    if (state.prop) list = list.filter((m) => m.ratings[state.prop] >= state.min);
    if (state.sortId) {
      const col = columns.find((c) => c.id === state.sortId);
      list = [...list].sort((a, b) => {
        const [x, y] = [col.value(a), col.value(b)];
        const r = col.text ? String(x).localeCompare(String(y), "he") : x - y;
        return r * state.dir;
      });
    }
    return list;
  }

  function update() {
    headers.forEach(({ c, th }) => {
      const active = state.sortId === c.id;
      th.setAttribute("aria-sort", active ? (state.dir === 1 ? "ascending" : "descending") : "none");
    });
    const list = rows();
    tbody.replaceChildren(
      ...list.map((m) =>
        h(
          "tr",
          { style: `--c: var(${colorOf(m)})` },
          h("th", { scope: "row", html: bidi(m.name) }),
          h("td", {}, FAMILY_LABEL[m.family]),
          h("td", { html: bidi(techNames(m).join(", ")) }),
          ...AXES.map((a) => h("td", {}, dotMeter(m.ratings[a.key], 5, a.label, { small: true }))),
          h("td", { style: "--c: var(--accent)" }, dotMeter(SAFETY[m.safety.level].n, 3, "רמת זהירות", { small: true }))
        )
      )
    );
    count.textContent = list.length ? `מוצגים ${list.length} מתוך ${materials.length} חומרים` : "אין חומר שעונה על הסינון. נסו ציון נמוך יותר.";
  }

  // --- filters ---
  const familyFilter = selector({
    label: "סינון לפי משפחה",
    role: "radio",
    items: [{ id: "all", label: "הכל" }, ...FAMILIES],
    selected: "all",
    onSelect: (id) => { state.family = id; update(); },
  });
  const propSelect = h("select", { "aria-label": "תכונה לסינון" }, h("option", { value: "" }, "ללא סינון"), AXES.map((a) => h("option", { value: a.key }, a.label)));
  const minSelect = h("select", { "aria-label": "ציון מינימלי" }, [2, 3, 4, 5].map((n) => h("option", { value: n, selected: n === state.min }, `${n} ומעלה`)));
  propSelect.addEventListener("change", () => { state.prop = propSelect.value; update(); });
  minSelect.addEventListener("change", () => { state.min = Number(minSelect.value); update(); });

  update();
  return h(
    "div",
    { class: "mat-table" },
    h("h3", {}, "השוואה מלאה"),
    h("div", { class: "mat-filters" }, familyFilter.node, h("label", { class: "field" }, "רק חומרים עם", propSelect, "בציון", minSelect)),
    count,
    h("div", { class: "table-wrap", tabindex: "0", role: "region", "aria-label": "טבלת השוואת חומרים" }, h("table", {}, h("thead", {}, h("tr", {}, headers.map((x) => x.th))), tbody))
  );
}

/** @param {HTMLElement} el the <section id="materials"> element */
export function render(el) {
  el.append(...sectionHeader("materials"), ...buildExplorer(), buildTable());
}
