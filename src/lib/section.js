/** Shared section scaffolding: heading + intro (from data/copy.js) + a "coming soon" placeholder. */
import { h } from "./dom.js";
import { bidi } from "./bidi.js";
import { sections } from "../data/copy.js";

/** Header block (title + intro) for the section with this id. */
export function sectionHeader(id) {
  const info = sections.find((s) => s.id === id);
  return [
    h("h2", { html: bidi(info.title) }),
    h("p", { class: "section__intro", html: bidi(info.intro) }),
  ];
}

/** Dashed box shown until the real content for a milestone is built. */
export function placeholder(text = "בקרוב") {
  return h("div", { class: "placeholder" }, text);
}
