/**
 * Builds the frame for one animated diagram: the SVG, its legend, and the "play only while on
 * screen" wiring. Used by the technologies and FDM-types sections.
 *
 * @param {object|undefined} diagramModule one of src/diagrams/*.js (create + legend); undefined -> "coming soon"
 * @param {{animate:boolean, onStep?:(i:number)=>void, caption?:string}} opts
 * @returns {{node:HTMLElement, destroy:()=>void}} destroy() stops the animation and its observer
 */
import { h } from "./dom.js";
import { svgEl } from "./svg.js";
import { whenVisible } from "./reveal.js";

export function diagramFrame(diagramModule, { animate, onStep, caption } = {}) {
  const node = h("div", { class: "diagram" });
  if (!diagramModule) {
    node.append(h("div", { class: "diagram__soon" }, "אנימציה לטכנולוגיה הזו תתווסף בהמשך"));
    return { node, destroy() {} };
  }

  // dir="ltr": a drawing of a physical machine must not mirror in RTL.
  const svg = svgEl("svg", { class: "diagram__svg", dir: "ltr", preserveAspectRatio: "xMidYMid meet" });
  const control = diagramModule.create(svg, { animate, onStep });
  node.append(svg);
  if (caption) node.append(h("p", { class: "diagram__caption" }, caption)); // (append(null) would print the word "null")
  node.append(h("ul", { class: "legend" }, control.legend.map((l) => h("li", { "data-kind": l.kind }, l.label))));

  const observer = whenVisible(node, { onEnter: () => control.play(), onLeave: () => control.pause() });
  return {
    node,
    destroy() {
      observer.kill();
      control.destroy();
    },
  };
}
