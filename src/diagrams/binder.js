/**
 * Binder jetting, side view. Like MJF's spray pass, but the jet sprays a glue (binder) that sticks
 * the powder together at room temperature. The printed "green" part is fragile (drawn pale); a
 * furnace then sinters the metal, which makes it solid, darker and a few percent smaller.
 * Steps: 0 spread, 1 jet binder, 2 next layer, 3 sinter in the furnace.
 */
import { createSprayBed } from "./mjf.js";

export const legend = [
  { label: "חלק נע", kind: "move" },
  { label: "חלק קבוע", kind: "box" },
  { label: "אבקה", kind: "powder" },
  { label: "החלק", kind: "fill" },
  { label: "דבק", kind: "hot" },
];

export const create = (svg, ctx) =>
  createSprayBed(svg, ctx, {
    lamp: false,
    green: true,
    legend,
    label: "ראש הזרקה מרסס דבק על אבקת מתכת, בסוף החלק השביר מסונטר בתנור והופך לחלק מתכת מוצק",
  });
