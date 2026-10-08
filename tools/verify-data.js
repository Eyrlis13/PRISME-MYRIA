/* Contrôle d'intégrité des données : node tools/verify-data.js */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = { window: {} };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
["catalogue", "contexts", "configurations", "comparisons"].forEach((f) =>
  vm.runInContext(fs.readFileSync(path.join(root, "data", f + ".js"), "utf8"), sandbox, { filename: f })
);
const D = sandbox.window.PRISME.data;
const errors = [];
const err = (m) => errors.push(m);
const ids = (a) => new Set(a.map((x) => x.id));
const dup = (name, a) => { const s = ids(a); if (s.size !== a.length) err(`${name} : identifiants dupliqués`); };

["domains", "conceptions", "contexts", "configurations", "justifications", "comparisons", "references"].forEach((k) => dup(k, D[k]));
if (D.domains.length !== 11) err(`11 domaines attendus, ${D.domains.length} trouvés`);
if (D.conceptions.length !== 5) err(`5 conceptions attendues, ${D.conceptions.length} trouvées`);

const dom = ids(D.domains), con = ids(D.conceptions), ctx = ids(D.contexts), cfg = ids(D.configurations), jus = ids(D.justifications), ref = ids(D.references);
const checkSupports = (where, arr) => (arr || []).forEach((s) => { if (!ref.has(s.ref)) err(`${where} : référence inconnue ${s.ref}`); });
const checkFace = (where, f) => {
  if (f === null) return;
  ["short", "full"].forEach((k) => { if (!f[k]) err(`${where} : ${k} manquant`); });
  if (f.short && f.short.length > 90) err(`${where} : formulation courte trop longue (${f.short.length} > 90)`);
  if (f.origin && !D.origins[f.origin]) err(`${where} : origine inconnue ${f.origin}`);
  checkSupports(where, f.supports);
};

D.configurations.forEach((c) => {
  if (!dom.has(c.domainId)) err(`${c.id} : domaine inconnu`);
  if (!con.has(c.conceptionId)) err(`${c.id} : conception inconnue`);
  if (!ctx.has(c.contextId)) err(`${c.id} : contexte inconnu`);
  checkFace(`${c.id}.content`, c.content);
  if (!c.justificationIds.length) err(`${c.id} : aucune justification`);
  c.justificationIds.forEach((j) => {
    if (!jus.has(j)) err(`${c.id} : justification inconnue ${j}`);
    else if (D.justifications.find((x) => x.id === j).configId !== c.id) err(`${j} : configId incohérent`);
  });
  if (!["conclusion", "formulation"].includes(c.assessment.mode)) err(`${c.id} : mode d'appréciation invalide`);
});
D.justifications.forEach((j) => {
  if (!cfg.has(j.configId)) err(`${j.id} : configuration inconnue`);
  checkFace(`${j.id}.valueReference`, j.valueReference);
  checkFace(`${j.id}.function`, j.function);
  if (j.function && !D.functionTypes[j.function.type]) err(`${j.id} : type de fonction inconnu`);
});
D.comparisons.forEach((c) => {
  if (!dom.has(c.domainId)) err(`${c.id} : domaine inconnu`);
  c.configIds.forEach((id) => { if (!cfg.has(id)) err(`${c.id} : configuration inconnue ${id}`); });
  [...c.constant, ...c.varies, ...(c.unspecified || [])].forEach((k) => { if (!D.elements[k]) err(`${c.id} : élément inconnu ${k}`); });
  const all = [...c.constant, ...c.varies, ...(c.unspecified || [])];
  if (new Set(all).size !== all.length) err(`${c.id} : un élément est classé deux fois`);
  if (c.contextMode === "common" && !ctx.has(c.contextId)) err(`${c.id} : contexte commun inconnu`);
  if (c.contextMode === "common") c.configIds.forEach((id) => { if (D.configurations.find((x) => x.id === id).contextId !== c.contextId) err(`${c.id} : ${id} n'a pas le contexte commun`); });
  if (c.situations) c.situations.forEach((s) => c.configIds.forEach((id) => { if (!s.byConfig[id]) err(`${c.id}/${s.id} : implication manquante pour ${id}`); }));
});
D.contexts.forEach((c) => { if (c.constructed !== true) err(`${c.id} : contexte non marqué comme construit`); });

/* Exigences de contenu de l'énoncé */
const A = D.configurations.find((c) => c.id === "cfg-acces-A"), B = D.configurations.find((c) => c.id === "cfg-acces-B");
if (A.content.full !== B.content.full) err("accès : les contenus A et B diffèrent");
if (A.assessment.standard !== B.assessment.standard || A.assessment.observed !== B.assessment.observed) err("accès : standard ou constat différents");
if (/\d\s*%/.test(JSON.stringify(D.configurations))) err("pourcentage détecté dans les configurations");
const pj = D.justifications.filter((j) => j.configId.startsWith("cfg-pert"));
if (pj.some((j) => j.function !== null)) err("pertinence : la fonction doit rester non renseignée");

if (errors.length) { console.error(errors.map((e) => "ERREUR " + e).join("\n")); process.exit(1); }
console.log(`OK : ${D.domains.length} domaines, ${D.conceptions.length} conceptions, ${D.configurations.length} configurations, ${D.justifications.length} justifications, ${D.comparisons.length} groupes de comparaison.`);
