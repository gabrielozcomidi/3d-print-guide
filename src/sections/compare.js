// Section: mechanism comparison. One row per technology: how a layer is made, how thick the layers
// are (all rows on the same log axis, so bars can be compared by eye), detail, speed, supports, and
// how much work is left after printing. All values come from src/data/technologies.js.
import "../styles/compare.css";
import { h } from "../lib/dom.js";
import { bidi, ltr } from "../lib/bidi.js";
import { sectionHeader } from "../lib/section.js";
import { dotMeter, layerRange } from "../lib/meters.js";
import { technologies } from "../data/technologies.js";

const SUPPORTS = { none: "לא נדרשות", needed: "נדרשות" };

/** @param {HTMLElement} el the <section id="compare"> element */
export function render(el) {
  const head = ["טכנולוגיה", "איך נוצרת שכבה", "עובי שכבה", "פירוט", "מהירות", "תמיכות", "עבודה אחרי ההדפסה"];

  const rows = technologies.map((t) =>
    h(
      "tr",
      { style: `--c: var(${t.color})` },
      h("th", { scope: "row" }, h("span", { class: "chip", html: bidi(t.name) })),
      h("td", { html: bidi(t.layerBy) }),
      h("td", { class: "cmp-range" }, layerRange(t.layerHeightMm, { ends: false }), h("span", { class: "spec__note", html: `${ltr(`${t.layerHeightMm.min}–${t.layerHeightMm.max}`)} מ״מ` })),
      h("td", {}, dotMeter(t.detail, 5, "פירוט", { small: true })),
      h("td", {}, dotMeter(t.speed, 5, "מהירות", { small: true })),
      h("td", {}, SUPPORTS[t.supports]),
      h("td", {}, dotMeter(t.postEffort, 5, "עבודה אחרי ההדפסה", { small: true }))
    )
  );

  el.append(
    ...sectionHeader("compare"),
    h(
      "div",
      { class: "mat-table cmp" },
      h(
        "div",
        { class: "table-wrap", tabindex: "0", role: "region", "aria-label": "טבלת השוואת מנגנונים" },
        h("table", {}, h("thead", {}, h("tr", {}, head.map((t) => h("th", { scope: "col" }, t)))), h("tbody", {}, rows))
      ),
      h("p", { class: "spec__note", html: bidi("עובי השכבה מוצג על סולם לוגריתמי משותף (0.01 עד 0.5 מ״מ), ולכן אפשר להשוות בין הפסים. פירוט ומהירות: 5 הכי גבוה. עבודה אחרי ההדפסה: 5 הכי הרבה. הערכים אופייניים להשוואה ולא מדידות.") })
    )
  );
}
