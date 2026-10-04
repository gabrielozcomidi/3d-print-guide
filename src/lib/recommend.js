/**
 * Wizard scoring: pure functions, no DOM, so they can be run from node (see scripts/check-wizard.js).
 *
 * recommend(answers):
 *   1. Add up the `weights` of every chosen option (data/wizard.js).
 *   2. Technology = highest total (ties: wizard.tieBreak order).
 *   3. Material = highest total among the materials that technology can print (ties: data order).
 *   4. Runner-up = the next technology (different from the winner) with its own best material.
 *   5. reasons = the `meaning` of each answer that pushed toward the winning technology or material.
 */
import { wizard } from "../data/wizard.js";
import { technologies } from "../data/technologies.js";
import { materials } from "../data/materials.js";

/** Technologies that can be recommended = the ones that appear in some option's weights. */
const candidateIds = () => {
  const ids = new Set();
  for (const q of wizard.questions) for (const o of q.options) for (const id of Object.keys(o.weights)) ids.add(id);
  return technologies.filter((t) => ids.has(t.id)).map((t) => t.id);
};

/** @param {Record<string,string>} answers question id -> option id */
export function recommend(answers) {
  const chosen = wizard.questions.map((q) => q.options.find((o) => o.id === answers[q.id])).filter(Boolean);
  const score = (id) => chosen.reduce((sum, o) => sum + (o.weights[id] ?? 0), 0);

  const rank = candidateIds()
    .map((id) => ({ id, score: score(id) }))
    .sort((a, b) => b.score - a.score || wizard.tieBreak.indexOf(a.id) - wizard.tieBreak.indexOf(b.id));

  const bestMaterial = (techId) =>
    materials
      .filter((m) => m.techIds.includes(techId))
      .map((m) => ({ m, s: score(m.id) }))
      .reduce((best, cur) => (cur.s > best.s ? cur : best)).m; // reduce keeps the FIRST on ties = data order

  const pick = (techId) => ({ tech: technologies.find((t) => t.id === techId), material: bestMaterial(techId) });

  const winner = pick(rank[0].id);
  const reasons = chosen
    .filter((o) => (o.weights[winner.tech.id] ?? 0) > 0 || (o.weights[winner.material.id] ?? 0) > 0)
    .map((o) => o.meaning);

  return { ...winner, reasons, runnerUp: rank[1] ? pick(rank[1].id) : null };
}
