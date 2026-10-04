// Quick sanity check for the wizard: runs a few typical answer sets and prints what it recommends.
// Run: node scripts/check-wizard.js   (edit data/wizard.js, run again to see the effect of new weights)
// Each case lists the answers and the result you EXPECT; a mismatch exits with an error.

import { recommend } from "../src/lib/recommend.js";

const cases = [
  { name: "display piece, indoors, coarse, minimal effort", a: { strength: "display", environment: "indoor", detail: "coarse", handling: "minimal" }, expect: ["fdm", "pla"] },
  { name: "strong, outdoors, medium, minimal effort", a: { strength: "high", environment: "outdoor", detail: "medium", handling: "minimal" }, expect: ["fdm", "asa"] },
  { name: "display piece, indoors, very fine, gloves OK", a: { strength: "display", environment: "indoor", detail: "fine", handling: "gloves" }, expect: ["msla", "resin-standard"] },
  { name: "strong, indoors, medium, via a service", a: { strength: "high", environment: "indoor", detail: "medium", handling: "service" }, expect: ["mjf", "pa12"] },
  { name: "strong, outdoors, medium, via a service", a: { strength: "high", environment: "outdoor", detail: "medium", handling: "service" }, expect: ["mjf", "pa11"] },
  { name: "normal strength, outdoors, coarse, minimal effort", a: { strength: "normal", environment: "outdoor", detail: "coarse", handling: "minimal" }, expect: ["fdm", "asa"] },
];

let bad = 0;
for (const c of cases) {
  const r = recommend(c.a);
  const got = [r.tech.id, r.material.id];
  const ok = got.join() === c.expect.join();
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FAIL"} ${c.name}\n       -> ${got.join(" + ")}${ok ? "" : `   (expected ${c.expect.join(" + ")})`}   runner-up: ${r.runnerUp.tech.id} + ${r.runnerUp.material.id}`);
}
process.exit(bad ? 1 : 0);
