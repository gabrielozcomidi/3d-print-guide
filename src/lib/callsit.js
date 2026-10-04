/**
 * "What slicers call it": small rows of [slicer, name]. Both are English and shown left-to-right
 * on their own, so RTL punctuation can never scramble them (a single mixed sentence would).
 */
import { h } from "./dom.js";

/** @param {[string,string][]} pairs */
export function callsIt(pairs) {
  return h(
    "div",
    { class: "callsit" },
    h("h4", {}, "איך קוראים לזה בסלייסרים"),
    h("dl", {}, pairs.map(([slicer, name]) => h("div", {}, h("dt", { dir: "ltr" }, slicer), h("dd", { dir: "ltr" }, name))))
  );
}
