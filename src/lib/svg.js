/** Create SVG elements (they need the SVG namespace, so plain createElement won't work). */
const NS = "http://www.w3.org/2000/svg";

/** svgEl("rect", { x: 0, y: 0, width: 10 }, childEl) */
export function svgEl(tag, attrs = {}, ...children) {
  const el = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  for (const child of children.flat()) if (child) el.append(child);
  return el;
}
