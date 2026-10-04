/**
 * Bidi helpers: keep English terms and numbers inside Hebrew text rendering correctly.
 *
 * Problem: in "מדפסת FDM, מהירה" the comma next to "FDM" can jump to the wrong side,
 * and "0.05-0.3 מ״מ" can come out reversed. Wrapping the Latin/number run in <bdi>
 * (bidirectional isolate) fixes it.
 *
 * Use bidi() on any Hebrew string from the data files before inserting as HTML.
 */

// A "Latin run": starts with a letter/digit, continues with letters, digits and + - / . %
// Optional space-separated continuation covers "PA 12" or "Carbon Fiber".
// A parenthesised Latin group "(IPA)" is one run too (so the brackets never get split from it).
// A trailing " (Latin)" stays attached, so "Nylon (PA)" is one isolated run and not three pieces.
const LATIN_RUN = /\([A-Za-z0-9][A-Za-z0-9+\-–/.%° ]*\)|[A-Za-z0-9][A-Za-z0-9+\-–/.%°]*(?: [A-Za-z0-9+\-–/.%°]*[A-Za-z0-9+%])*(?: \([A-Za-z0-9+\-–/.%° ]+\))?/g;

/** Escape text so data strings can never inject HTML. */
export function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/**
 * Turn plain text into an HTML string where every Latin/number run is wrapped in <bdi>.
 * Trailing "." is kept outside the run so a sentence ending in "PLA." is not swallowed.
 * @param {string} text
 * @returns {string} safe HTML
 */
export function bidi(text) {
  return (
    escapeHtml(String(text))
      .replace(LATIN_RUN, (run) => {
        const m = run.match(/^(.*?)([.\-–/]*)$/s); // peel trailing punctuation off the run
        // short terms ("PLA", "(Z offset)") never break across lines; long English phrases may wrap
        const lang = /[A-Za-z]/.test(m[1]) ? ' lang="en"' : ""; // so screen readers pronounce English terms as English
        return `<bdi${lang}${m[1].length <= 16 ? ' class="nw"' : ""}>${m[1]}</bdi>${m[2]}`;
      })
      // Hebrew words joined by a maqaf (תלת־ממד) must not break across lines. Done AFTER the Latin pass so it never sees the tags above.
      .replace(/[֐-׿]+־[֐-׿]+/g, (w) => `<span class="nw">${w}</span>`)
  );
}

/** Wrap a value that must always read left-to-right, e.g. "0.05-0.3". */
export function ltr(text) {
  return `<bdi dir="ltr">${escapeHtml(String(text))}</bdi>`;
}
