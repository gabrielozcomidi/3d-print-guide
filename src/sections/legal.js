// Legal pages: accessibility statement, privacy policy, terms of use. Plain text pages: a title, short intro,
// then titled blocks. ALL wording and the owner's details are in src/data/legal.js (the owner fills in `owner` there).
import "../styles/legal.css";
import { h } from "../lib/dom.js";
import { bidi } from "../lib/bidi.js";
import { sectionHeader } from "../lib/section.js";
import { owner, formatDate, accessibility, privacy, terms } from "../data/legal.js";

/** A detail from `owner`: shown as given, or as a visible "missing" marker so it can never be overlooked. */
const detail = (value) => (String(value ?? "").trim() ? bidi(value) : '<span class="legal__missing">חסר: יש להשלים בקובץ legal.js</span>');
const para = (text) => h("p", { html: bidi(text) });
const list = (items) => h("ul", { class: "legal__list" }, items.map((t) => h("li", { html: bidi(t) })));
/** A titled block (h2 is the page title, so blocks are h3). */
const block = (title, ...content) => h("section", { class: "legal__block", "aria-label": title }, h("h3", {}, title), ...content);
/** The last-updated line. */
const updated = () => h("p", { class: "legal__updated" }, `עודכן לאחרונה: ${formatDate(owner.statementDate)}`);

/** Contact lines for the accessibility coordinator, with real mailto / tel links when filled in. */
function contactLines() {
  const mail = owner.coordinatorEmail?.trim();
  const tel = owner.coordinatorPhone?.trim();
  return h(
    "dl",
    { class: "legal__contact" },
    h("div", {}, h("dt", {}, "איש קשר לנגישות"), h("dd", { html: detail(owner.coordinatorName) })),
    h("div", {}, h("dt", {}, "דוא״ל"), h("dd", {}, mail ? h("a", { href: `mailto:${mail}`, dir: "ltr" }, mail) : h("span", { class: "legal__missing" }, "חסר: יש להשלים בקובץ legal.js"))),
    h("div", {}, h("dt", {}, "טלפון"), h("dd", {}, tel ? h("a", { href: `tel:${tel.replace(/[^\d+]/g, "")}`, dir: "ltr" }, tel) : h("span", { class: "legal__missing" }, "חסר: יש להשלים בקובץ legal.js")))
  );
}

export function renderAccessibility(el) {
  const a = accessibility;
  el.append(
    ...sectionHeader("accessibility"),
    para(a.intro),
    block(a.standard.title, ...a.standard.paragraphs.map(para), para(owner.audit === "external" ? a.standard.externalChecked(formatDate(owner.auditDate)) : a.standard.selfChecked)),
    block(a.done.title, list(a.done.items)),
    block(a.tool.title, para(a.tool.text)),
    block(a.limits.title, para(a.limits.text)),
    block(a.contact.title, para(a.contact.text(owner.responseDays)), contactLines()),
    updated()
  );
}

export function renderPrivacy(el) {
  el.append(
    ...sectionHeader("privacy"),
    para(privacy.intro),
    ...privacy.sections.map((s) => block(s.title, s.items ? list(s.items) : para(typeof s.text === "function" ? s.text(owner.hosting) : s.text))),
    block("יצירת קשר", h("p", { html: `${bidi("שאלות על הפרטיות? אפשר לכתוב ל")}${owner.contactEmail?.trim() ? ` <a href="mailto:${owner.contactEmail.trim()}" dir="ltr">${owner.contactEmail.trim()}</a>` : ` ${detail("")}`}.` })),
    updated()
  );
}

export function renderTerms(el) {
  el.append(
    ...sectionHeader("terms"),
    para(terms.intro),
    ...terms.sections.map((s) => block(s.title, para(typeof s.text === "function" ? s.text(owner.operatorName) : s.text))),
    updated()
  );
}
