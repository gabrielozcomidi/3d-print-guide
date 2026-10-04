/** Hand-drawn arrow used between things that lead to each other (technology -> materials, slicer -> fork).
 *  Drawn pointing right; mirrored to point left in RTL by .flow-arrow in usecases.css. */
import { svgEl } from "./svg.js";

export const flowArrow = () => {
  const svg = svgEl("svg", { class: "flow-arrow", viewBox: "0 0 44 20", "aria-hidden": "true" });
  svg.append(svgEl("path", { d: "M3 10 H39 M31 3 L39 10 L31 17" }));
  return svg;
};
