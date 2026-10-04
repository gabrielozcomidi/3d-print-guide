/**
 * The site's one selector pattern: a row of plain text items, each with an optional hollow dot
 * in its colour; the selected item gets a wavy underline (see .selector in base.css).
 * Used for the technology tabs, the materials family filter, and any future "pick one" row.
 *
 * role "tab":   items control a tabpanel (needs aria-controls). Ids: <idPrefix>-<id> -> controls panel-<id>
 *               (or one shared panel via `controls`). Give every selector on the page its own idPrefix,
 *               otherwise ids collide (e.g. two sections both having an "fdm" or "resin" item).
 * role "radio": items act like filters (single choice).
 *
 * Keyboard: arrows move between items, Home/End jump. In RTL the first item is on the right,
 * so ArrowLeft goes to the NEXT item.
 *
 * @param {{label:string, items:{id:string,label:string,color?:string}[], selected:string|null,
 *          onSelect:(id:string)=>void, role?:"tab"|"radio", controls?:string, className?:string, idPrefix?:string}} opts
 * @returns {{node:HTMLElement, setSelected:(id:string,o?:{focus?:boolean})=>void}}
 */
import { h } from "./dom.js";
import { bidi } from "./bidi.js";
import { isRTL } from "./reveal.js";

export function selector({ label, items, selected, onSelect, role = "tab", controls, className = "", idPrefix = "tab" }) {
  const isTab = role === "tab";
  const stateAttr = isTab ? "aria-selected" : "aria-checked";

  const buttons = items.map((item) =>
    h("button", {
      class: "selector__item",
      type: "button",
      role,
      id: isTab ? `${idPrefix}-${item.id}` : null,
      "aria-controls": isTab ? controls ?? `panel-${item.id}` : null,
      style: item.color ? `--c: var(${item.color})` : null,
      "data-dot": item.color ? "" : null,
      html: bidi(item.label),
    })
  );
  const node = h("div", { class: `selector ${className}`.trim(), role: isTab ? "tablist" : "radiogroup", "aria-label": label }, buttons);

  function setSelected(id, { focus = false } = {}) {
    const anySelected = items.some((it) => it.id === id);
    buttons.forEach((b, i) => {
      const on = items[i].id === id;
      b.setAttribute(stateAttr, String(on));
      // roving tabindex: arrows move within the row, Tab leaves it. With nothing selected yet
      // (a wizard question), the first item stays reachable so keyboard users can get in.
      b.tabIndex = on || (!anySelected && i === 0) ? 0 : -1;
      if (on && focus) b.focus();
    });
  }

  function choose(id, opts) {
    setSelected(id, opts);
    onSelect(id);
  }

  buttons.forEach((b, i) => b.addEventListener("click", () => choose(items[i].id)));
  node.addEventListener("keydown", (e) => {
    const i = buttons.indexOf(document.activeElement);
    if (i < 0) return;
    const forward = isRTL() ? "ArrowLeft" : "ArrowRight";
    const backward = isRTL() ? "ArrowRight" : "ArrowLeft";
    let next = null;
    if (e.key === forward) next = (i + 1) % items.length;
    else if (e.key === backward) next = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next == null) return;
    e.preventDefault();
    choose(items[next].id, { focus: true });
  });

  setSelected(selected);
  return { node, setSelected };
}
