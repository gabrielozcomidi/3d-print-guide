// Temporary screen for steps that are built in later tasks (first layer, finish). Remove once they exist.
import { h } from "../../dom.js";

export function mount(host, ctx) {
  host.append(h("p", { class: "spec__note" }, "השלב הזה עדיין בבנייה."));
  ctx.complete();
  return { destroy() {} };
}
