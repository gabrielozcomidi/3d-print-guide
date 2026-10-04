// Entry point: loads styles, builds each section from data, then sets up the chapter navigation.
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/a11y.css";

import { h } from "./lib/dom.js";
import { bidi } from "./lib/bidi.js";
import { printerLogo } from "./lib/logo.js";
import { initA11y, mountA11y } from "./lib/a11y.js";
import { link } from "./lib/router.js";
import { footerLinks } from "./data/legal.js";
import { initNav } from "./lib/router.js";
import { footerNote } from "./data/copy.js";

import { render as hero } from "./sections/hero.js";
import { render as overview } from "./sections/overview.js";
import { render as workflow } from "./sections/workflow.js";
import { render as technologies } from "./sections/technologies.js";
import { render as fdmtypes } from "./sections/fdmtypes.js";
import { render as supports } from "./sections/supports.js";
import { render as infill } from "./sections/infill.js";
import { render as industrial } from "./sections/industrial.js";
import { render as compare } from "./sections/compare.js";
import { render as materials } from "./sections/materials.js";
import { render as troubleshooting } from "./sections/troubleshooting.js";
import { render as usecases } from "./sections/usecases.js";
import { render as wizard } from "./sections/wizard.js";
import { renderAccessibility, renderPrivacy, renderTerms } from "./sections/legal.js";

// Tells CSS that JS is running, so [data-reveal] elements may start hidden (see base.css).
document.documentElement.classList.add("js");

// saved accessibility choices (e.g. "stop animations") must be in place before anything renders
initA11y();

// id in index.html -> render function. (Which chapter each section belongs to: data/chapters.js)
const renderers = { hero, overview, workflow, technologies, fdmtypes, supports, infill, industrial, compare, materials, troubleshooting, usecases, wizard, accessibility: renderAccessibility, privacy: renderPrivacy, terms: renderTerms };
for (const [id, render] of Object.entries(renderers)) {
  render(document.getElementById(id));
}

// Footer
document.getElementById("footer").append(
  printerLogo(),
  h("p", { html: bidi(footerNote) }),
  h("nav", { class: "footer-links", "aria-label": "מידע משפטי ונגישות" }, footerLinks.map((l) => link(l.id, {}, l.label)))
);

// Chapters, side menu, mobile top bar. Must run after the sections exist: it moves them into chapters.
initNav();
mountA11y();
