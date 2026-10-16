/* Contrôle d'intégrité des données : node tools/verify-data.js */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const vm = require("vm");

const root = path.join(__dirname, "..");
const D = JSON.parse(fs.readFileSync(path.join(root, "data", "PRISME_MAJ_2026-10-16.json"), "utf8"));
const errors = [];
const err = (m) => errors.push(m);

/* le script chargé par l'application doit correspondre au JSON */
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "data", "prisme-data.js"), "utf8"), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "data", "interface-fr.js"), "utf8"), sandbox);
if (JSON.stringify(sandbox.window.PRISME_DATA) !== JSON.stringify(D)) err("data/prisme-data.js n'est pas à jour : lancer node tools/build-data.js");
const UI = sandbox.window.PRISME.ui;

const dims = D.interface.dimension_order;
const profiles = Object.keys(D.profiles);
const srcIds = new Set(D.sources.map((s) => s.id));
const statuses = new Set(Object.keys(UI.statusLabels));
const refOk = (ref, where) => { const id = ref.split(":")[0]; if (!srcIds.has(id)) err(where + " : source inconnue " + ref); };

/* empreinte du dossier : même calcul que recherche/build_research.py (json.dumps Python, ensure_ascii=False) */
const pyDumps = (objective, facts) => "[" + JSON.stringify(objective) + ", [" + facts.map((f) => JSON.stringify(f)).join(", ") + "]]";

if (D.cases.length !== 15) err("15 cas attendus");
if (profiles.join("") !== "MIGVN") err("profils attendus M I G V N");
if (dims.join(",") !== "qualification,portee,preuve,regle") err("ordre des dimensions inattendu");
D.model.dimensions.forEach((d) => { if (!UI.dimColors[d.id] || !UI.dimRoles[d.id]) err("dimension sans couleur ou rôle : " + d.id); });
profiles.forEach((p) => {
  dims.forEach((d) => { if (!D.profiles[p].generic_dimensions[d]) err(p + " : orientation générique manquante " + d); });
  D.profiles[p].sources.forEach((r) => refOk(r, "profil " + p));
  if (!UI.specLabels[p]) err(p + " : libellé de spécification manquant");
});
let readings = 0;
D.cases.forEach((c) => {
  const h = crypto.createHash("sha256").update(pyDumps(c.objective, c.facts), "utf8").digest("hex");
  if (h !== c.dossier_hash) err(c.id + " : empreinte du dossier différente");
  profiles.forEach((p) => {
    const r = c.readings[p];
    if (!r) { err(c.id + " : lecture " + p + " manquante"); return; }
    readings++;
    dims.forEach((d) => { if (!r.dimensions[d] || !r.dimensions[d].text || !r.dimensions[d].detail) err(c.id + "/" + p + " : dimension " + d + " incomplète"); });
    ["conclusion", "justification", "scope", "reserve"].forEach((k) => { if (!r[k]) err(c.id + "/" + p + " : " + k + " vide"); });
    if (!statuses.has(r.status)) err(c.id + "/" + p + " : statut inconnu " + r.status);
    if (!r.references.length) err(c.id + "/" + p + " : aucune référence");
    r.references.forEach((ref) => refOk(ref, c.id + "/" + p));
  });
});
D.sensitivity.forEach((s) => { if (!D.cases.some((c) => c.id === s.case)) err(s.id + " : cas inconnu"); s.sources.forEach((r) => refOk(r, s.id)); });
D.pair_audits.forEach((a) => a.witness.forEach((w) => { if (!D.cases.some((c) => c.id === w)) err("audit " + a.pair + " : témoin inconnu " + w); }));
D.model.sources.forEach((r) => refOk(r, "modèle"));
if (!D.cases.some((c) => c.id === D.interface.default_case)) err("cas par défaut inconnu");
UI.quickCases.forEach((q) => { if (!D.cases.some((c) => c.id === q.id)) err("cas mis en avant inconnu " + q.id); });

if (errors.length) { console.error(errors.map((e) => "ERREUR " + e).join("\n")); process.exit(1); }
console.log("OK : " + D.cases.length + " cas, " + readings + " lectures, empreintes des dossiers vérifiées, " + D.sources.length + " sources, références résolues.");
