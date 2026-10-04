// Run before publishing: `npm run check:legal`.
// Fails while the owner's details in src/data/legal.js are missing, so the accessibility statement and the
// other legal pages are never published with blanks. (npm run validate only warns, so development is not blocked.)

import { owner } from "../src/data/legal.js";

const required = [
  ["operatorName", "שם בעל האתר או העסק"],
  ["contactEmail", "דוא״ל ליצירת קשר"],
  ["coordinatorName", "שם איש הקשר לנגישות"],
  ["coordinatorEmail", "דוא״ל איש הקשר לנגישות"],
  ["coordinatorPhone", "טלפון איש הקשר לנגישות"],
  ["statementDate", "תאריך עדכון ההצהרה"],
  ["hosting", "ספק האחסון"],
];
const missing = required.filter(([k]) => !String(owner[k] ?? "").trim());
const problems = missing.map(([k, label]) => `owner.${k} (${label})`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(owner.statementDate)) problems.push("owner.statementDate must look like 2026-10-04");
if (owner.audit === "external" && !owner.auditDate) problems.push("owner.auditDate is needed when owner.audit is \"external\"");
if (!Number.isInteger(owner.responseDays) || owner.responseDays < 1) problems.push("owner.responseDays must be a whole number of days");

if (problems.length) {
  console.error("\nLegal details are not complete (src/data/legal.js):\n" + problems.map((p) => "  - " + p).join("\n") + "\n");
  process.exit(1);
}
console.log("Legal details OK.");
