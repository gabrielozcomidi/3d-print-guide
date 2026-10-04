/**
 * Scroll animation helpers. ALL animation in the project goes through here so that
 * reduced-motion handling lives in exactly one place.
 *
 * Why GSAP + ScrollTrigger: it can pin sections and scrub animations to scroll position,
 * which plain CSS can't do reliably yet.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** True when the user asked the OS/browser for less motion. Checked per call (it can change). */
/** True when the OS asks for less motion OR the visitor switched animations off in the accessibility menu (class set by lib/a11y.js). */
export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("a11y-motion");

/** Page direction. Used to flip signed horizontal offsets; we avoid horizontal scrolling entirely. */
export const isRTL = () => document.documentElement.dir === "rtl";

/**
 * Fade+rise elements into view the first time they scroll on screen.
 * With reduced motion: do nothing (CSS already shows them; see base.css).
 * @param {Element[]|NodeList|string} targets
 */
export function reveal(targets) {
  if (prefersReducedMotion()) return;
  gsap.utils.toArray(targets).forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
  });
}

/**
 * Call onEnter when `el` is on screen and onLeave when it isn't.
 * Used later to start/pause looping process diagrams off-screen.
 */
export function whenVisible(el, { onEnter, onLeave } = {}) {
  // IntersectionObserver (not ScrollTrigger) because it also reports an element that is
  // ALREADY on screen when observation starts, e.g. after switching tabs.
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? onEnter?.() : onLeave?.()),
    { threshold: 0.25 }
  );
  io.observe(el);
  return { kill: () => io.disconnect() };
}

export { gsap, ScrollTrigger };
