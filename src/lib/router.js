/**
 * Navigation: chapters, side menu, mobile top bar + index, "next chapter" links.
 *
 * Why: the page had 13 sections in one long scroll. Now sections are grouped into chapters
 * (data/chapters.js) and only one chapter is visible at a time. The URL hash picks what to show:
 *   #machines          -> chapter "machines", from its top
 *   #fdmtypes          -> the chapter that contains the section "fdmtypes", scrolled to that section
 * so links, the back button and bookmarks all work, and other modules can call go("technologies").
 *
 * Structure built here (the section elements already exist in index.html and are MOVED, not copied):
 *   <header.site-nav>      phone top bar: menu button + current chapter name
 *   <button.rail-open-btn> desktop: appears when the side menu is closed
 *   <div.layout>           desktop: grid with the side rail on the reading-start side (right in Hebrew)
 *     <nav.rail>           chapters, each with an arrow button that opens its sections
 *     <main>               one <div.chapter> per chapter, only the current one is visible
 *   <div.menu>             phone full-screen index (same table of contents)
 */
import { h } from "./dom.js";
import { bidi } from "./bidi.js";
import { svgEl } from "./svg.js";
import { flowArrow } from "./arrow.js";
import { printerLogo } from "./logo.js";
import { ScrollTrigger, prefersReducedMotion } from "./reveal.js";
import { chapters } from "../data/chapters.js";
import { sections as sectionInfo } from "../data/copy.js";

const labelOf = (sectionId) => sectionInfo.find((s) => s.id === sectionId)?.nav;
const chapterOfSection = (sectionId) => chapters.find((c) => c.sections.includes(sectionId));
const chapterById = (id) => chapters.find((c) => c.id === id);
/** The chapters shown in the menu and the "next chapter" links (legal pages are `hidden`). */
const navChapters = chapters.filter((c) => !c.hidden);

/** Sections with a menu label (the hero has none). */
const menuSections = (chapter) => chapter.sections.filter((id) => labelOf(id));

const state = { chapterId: null };
const open = new Set(); // chapters whose section list is expanded in the menus
let chapterEls = {};
let spy = null;

/** Make the menus match `open` (both the side rail and the phone index). */
function syncToc() {
  document.querySelectorAll(".toc__item[data-chapter]").forEach((li) => {
    const isOpen = open.has(li.dataset.chapter);
    li.dataset.open = String(isOpen);
    li.querySelector(".toc__toggle")?.setAttribute("aria-expanded", String(isOpen));
    const list = li.querySelector(".toc__sections");
    if (list) list.hidden = !isOpen;
  });
}

/** Show a chapter (and scroll to a section in it, if given). */
function show(chapterId, sectionId, { initial = false } = {}) {
  const chapter = chapterById(chapterId);
  const changed = state.chapterId !== chapterId;
  state.chapterId = chapterId;

  for (const c of chapters) chapterEls[c.id].hidden = c.id !== chapterId;
  const index = navChapters.indexOf(chapter); // -1 for a legal page

  // menu state: the current chapter is marked and its sections are open (others close, to keep the menu calm)
  document.querySelectorAll("[data-nav-chapter]").forEach((a) => a.setAttribute("aria-current", String(a.dataset.navChapter === chapterId)));
  document.querySelectorAll("[data-nav-section]").forEach((a) => a.removeAttribute("aria-current"));
  if (changed) {
    open.clear();
    open.add(chapterId);
    syncToc();
  }
  const bar = document.querySelector(".site-nav__title");
  if (bar) bar.replaceChildren(chapter.title, ...(index >= 0 ? [" ", h("span", { class: "nw" }, `(${index + 1} מתוך ${navChapters.length})`)] : [])); // the count never splits across lines
  document.title = `${chapter.title} | מדריך חזותי להדפסת תלת־ממד`;

  // jump to the right place
  const reduced = prefersReducedMotion();
  if (changed || !sectionId) window.scrollTo({ top: 0, behavior: "instant" }); // a chapter link always starts at the top of the chapter
  if (sectionId && sectionId !== "hero") {
    requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: reduced || initial || changed ? "auto" : "smooth", block: "start" }));
  }
  if (changed && !initial) chapterEls[chapterId].focus({ preventScroll: true }); // keyboard and screen-reader users land in the new chapter

  // scroll-spy: mark the section that is in view in the rail and the index
  spy?.disconnect();
  spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        document.querySelectorAll("[data-nav-section]").forEach((a) => a.setAttribute("aria-current", String(a.dataset.navSection === e.target.id)));
      }
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  chapter.sections.forEach((id) => spy.observe(document.getElementById(id)));

  if (changed) ScrollTrigger.refresh(); // scroll-driven animations need new positions after a chapter appears
}

/** Work out what a hash like "materials" or "fdmtypes" means. */
function route(id, opts) {
  if (id === "main") return chapterEls[state.chapterId]?.focus(); // the "skip to content" link: stay on this chapter
  const chapter = chapterById(id);
  if (chapter) return show(chapter.id, null, opts);
  const owner = chapterOfSection(id);
  if (owner) return show(owner.id, id, opts);
  show(chapters[0].id, null, opts); // unknown hash: start
}

/** Go to a chapter or a section from anywhere in the site. */
export function go(id) {
  if (location.hash.slice(1) === id) route(id);
  else location.hash = id; // hashchange runs route()
}

/** A link to a chapter or section. Uses go() so the same link works twice in a row and across chapters. */
export const link = (id, attrs, ...kids) => {
  const a = h("a", { href: `#${id}`, ...attrs }, ...kids);
  a.addEventListener("click", (e) => {
    e.preventDefault();
    go(id);
  });
  return a;
};

/** Hand-drawn chevron for the open/close buttons (points down; CSS turns it over when open). */
const chevron = () => {
  const svg = svgEl("svg", { class: "chevron", viewBox: "0 0 24 24", "aria-hidden": "true" });
  svg.append(svgEl("path", { d: "M5 9 L12 16 L19 9" }));
  return svg;
};

/**
 * The table of contents (side rail and phone index share it).
 * Each chapter with sections gets a round arrow button that opens its sections without leaving the page.
 * @param {string} prefix keeps element ids unique between the two copies
 */
function buildToc(prefix, { closeMenu } = {}) {
  const wrap = (a) => {
    if (closeMenu) a.addEventListener("click", closeMenu);
    return a;
  };
  return h(
    "ol",
    { class: "toc" },
    navChapters.map((c, i) => {
      const subs = menuSections(c);
      const hasSubs = subs.length > 1;
      const listId = `${prefix}-sections-${c.id}`;
      const toggle = hasSubs
        ? h("button", { class: "toc__toggle", type: "button", "aria-expanded": "false", "aria-controls": listId, "aria-label": `חלקי הפרק: ${c.title}` }, chevron())
        : null;
      toggle?.addEventListener("click", () => {
        if (open.has(c.id)) open.delete(c.id);
        else open.add(c.id);
        syncToc();
      });
      return h(
        "li",
        { class: "toc__item", "data-chapter": c.id },
        h(
          "div",
          { class: "toc__row" },
          wrap(link(c.id, { class: "toc__chapter", "data-nav-chapter": c.id }, h("span", { class: "toc__num" }, String(i + 1)), h("span", { class: "toc__title", html: bidi(c.title) }))),
          toggle
        ),
        hasSubs ? h("ul", { class: "toc__sections", id: listId, hidden: true }, subs.map((s) => h("li", {}, wrap(link(s, { class: "toc__section", "data-nav-section": s }, labelOf(s)))))) : null
      );
    })
  );
}

/** Wrap each chapter's sections in a <div.chapter> with a "next chapter" block (and quick links on phones). */
function buildChapters(main) {
  chapterEls = {};
  chapters.forEach((c, i) => {
    const el = h("div", { class: "chapter", id: `chapter-${c.id}`, tabindex: "-1", hidden: true, "aria-label": c.title });
    for (const id of c.sections) el.append(document.getElementById(id));

    // phones: quick links to the sections of this chapter, right under the top bar
    const subs = menuSections(c);
    if (subs.length > 1) {
      el.prepend(h("nav", { class: "chapter-jump", "aria-label": "בפרק הזה" }, subs.map((s) => link(s, {}, labelOf(s)))));
    }

    // every page needs an <h1>: chapters without one (the home page has its own) get a hidden one with the chapter name
    if (!el.querySelector("h1")) el.prepend(h("h1", { class: "sr-only" }, c.title));

    // end of chapter: where to go next (legal pages just lead back to the start)
    const next = c.hidden ? null : navChapters[navChapters.indexOf(c) + 1];
    el.append(
      h(
        "nav",
        { class: "chapter-next", "aria-label": "המשך" },
        next
          ? link(next.id, { class: "chapter-next__link" }, h("span", { class: "chapter-next__small" }, "הפרק הבא"), h("span", { class: "chapter-next__title", html: bidi(next.title) }), flowArrow())
          : link(chapters[0].id, { class: "chapter-next__link" }, h("span", { class: "chapter-next__small" }, c.hidden ? "מוכנים להמשיך?" : "סיימתם"), h("span", { class: "chapter-next__title" }, c.hidden ? "חזרה למדריך" : "חזרה להתחלה"), flowArrow())
      )
    );
    chapterEls[c.id] = el;
    main.append(el);
  });
}

// ------------------------------------------------------------------ remembering the side menu state
const RAIL_KEY = "guide-rail-closed";
const readClosed = () => {
  try {
    return localStorage.getItem(RAIL_KEY) === "1";
  } catch {
    return false; // storage can be blocked (private window): the menu just starts open
  }
};
const saveClosed = (closed) => {
  try {
    localStorage.setItem(RAIL_KEY, closed ? "1" : "0");
  } catch {
    /* ignore: remembering the state is a convenience */
  }
};

/** Small button with an icon and a visible label (so it is clear what it does). */
const labelled = (cls, icon, text, attrs) =>
  h("button", { class: `menu-toggle ${cls}`, type: "button", ...attrs }, h("span", { class: `menu-toggle__icon menu-toggle__icon--${icon}`, "aria-hidden": "true" }, h("span"), h("span")), h("span", {}, text));

/** Set everything up. Call after all sections have rendered. */
export function initNav() {
  const main = document.getElementById("main");
  const bar = document.getElementById("site-nav");

  buildChapters(main);

  // ----- desktop: side rail (can be closed and reopened) -----
  const closeRail = labelled("rail__close", "close", "סגירה", { "aria-controls": "rail", "aria-label": "סגירת התפריט" });
  const rail = h(
    "nav",
    { class: "rail", id: "rail", "aria-label": "ניווט בפרקים" },
    h("div", { class: "rail__head" }, link(chapters[0].id, { class: "rail__title" }, printerLogo(), h("span", {}, "מדריך הדפסת ", h("span", { class: "nw" }, "תלת־ממד"))), closeRail),
    buildToc("rail")
  );
  const openRail = labelled("rail-open-btn", "menu", "תפריט", { "aria-controls": "rail", "aria-label": "פתיחת התפריט" });
  const layout = h("div", { class: "layout" });
  main.before(layout);
  layout.append(rail, main);
  document.body.append(openRail);

  const setRailClosed = (closed, { focus = false } = {}) => {
    document.documentElement.classList.toggle("rail-closed", closed);
    rail.inert = closed;
    saveClosed(closed);
    if (focus) (closed ? openRail : closeRail).focus();
  };
  closeRail.addEventListener("click", () => setRailClosed(true, { focus: true }));
  openRail.addEventListener("click", () => setRailClosed(false, { focus: true }));
  setRailClosed(readClosed());

  // ----- phones: top bar + full-screen index -----
  const menuBtn = labelled("site-nav__btn", "menu", "תפריט", { "aria-expanded": "false", "aria-controls": "menu", "aria-label": "פתיחת התפריט" });
  const closeBtn = labelled("menu__close", "close", "סגירה", { "aria-label": "סגירת התפריט" });
  const setMenu = (isOpen) => {
    menu.hidden = !isOpen;
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    layout.inert = isOpen; // keeps keyboard focus and screen readers inside the open menu
    document.body.style.overflow = isOpen ? "hidden" : "";
    (isOpen ? closeBtn : menuBtn).focus();
  };
  const menu = h("div", { class: "menu", id: "menu", role: "dialog", "aria-modal": "true", "aria-label": "תוכן עניינים", hidden: true }, closeBtn, buildToc("menu", { closeMenu: () => setMenu(false) }));
  menuBtn.addEventListener("click", () => setMenu(true));
  closeBtn.addEventListener("click", () => setMenu(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && !menu.hidden && setMenu(false));
  bar.append(menuBtn, printerLogo(), h("span", { class: "site-nav__title" }));
  document.body.append(menu);

  window.addEventListener("hashchange", () => route(location.hash.slice(1)));
  route(location.hash.slice(1) || chapters[0].id, { initial: true });
}
