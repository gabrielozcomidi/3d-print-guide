/**
 * Metal laser powder bed fusion (DMLS/SLM), side view. Same mechanism as SLS, with three differences
 * that matter for metal: the laser MELTS the powder (not just sinters it), the whole chamber is
 * sealed and filled with inert gas (dashed outline), and the part grows on thin SUPPORT pillars
 * (first two layers) that anchor it and carry heat away.
 * Steps: 0 spread, 1 melt, 2 lower, 3 remove from the plate.
 */
import { createSls, legend as slsLegend } from "./sls.js";

export const legend = [...slsLegend, { label: "תא אטום עם גז אינרטי", kind: "dash" }];

export const create = (svg, ctx) =>
  createSls(svg, ctx, {
    metal: true,
    sealed: true,
    legend,
    label: "לייזר עוצמתי ממיס אבקת מתכת על גבי עמודי תמיכה, בתוך תא אטום עם גז אינרטי",
  });
