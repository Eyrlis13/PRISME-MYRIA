/* Contrôle des données : node tools/verify-data.js */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const dir = path.join(__dirname, "..", "data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const C = read("02_CONTENU_INTERFACE.json");
const M = read("03_MODELE_PRISME.json");
const errors = [];
const err = (m) => errors.push(m);

/* le script chargé par l'application doit être à jour */
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(dir, "prisme-data.js"), "utf8"), sandbox);
const B = sandbox.window.PRISME_DATA;
if (JSON.stringify(B.modele) !== JSON.stringify(M) || JSON.stringify(B.contenu) !== JSON.stringify(C)) err("data/prisme-data.js n'est pas à jour : lancer node tools/build-data.js");

/* 55 croisements, statuts et composantes */
const CIDS = C.conceptions.map((c) => c.id), DIDS = C.domaines.map((d) => d.id);
const COMP = ["raison", "portee", "preuves", "regle", "refutation"];
const count = { Proposed: 0, Exploratory: 0, Open: 0 };
CIDS.forEach((c) => DIDS.forEach((d) => {
  const k = c + d.slice(1), s = M.specifications[k];
  if (!s) return err("croisement manquant : " + k);
  count[s.statut] = (count[s.statut] || 0) + 1;
  COMP.forEach((x) => { if (!s[x] || typeof s[x].texte !== "string" || !Array.isArray(s[x].nature)) err(k + " : composante " + x + " invalide"); });
}));
if (count.Proposed !== M.decompte.proposees || count.Exploratory !== M.decompte.exploratoires || count.Open !== M.decompte.ouvertes) err("décompte des statuts : " + JSON.stringify(count));

/* rapports : schéma minimal */
const VERD = C.verdicts.map((v) => v.id).concat(["ouvert"]);
function checkReading(where, r) {
  if (!r.garantie && r.verdict !== "ouvert") return err(where + " : garantie manquante");
  if (r.garantie) ["raison", "portee", "preuves", "regle"].forEach((x) => { if (!r.garantie[x]) err(where + " : garantie." + x + " manquante"); });
  if (VERD.indexOf(r.verdict) < 0) err(where + " : verdict inconnu « " + r.verdict + " »");
  if (!r.manque) err(where + " : « manque » vide");
  if (r.verdict !== "ouvert" && !r.integre) err(where + " : « integre » vide");
  if (!r.pour_etayer || typeof r.pour_etayer.texte !== "string") err(where + " : « pour_etayer » manquant");
  else if (r.pour_etayer.verdict_vise !== null && VERD.indexOf(r.pour_etayer.verdict_vise) < 0) err(where + " : verdict visé inconnu");
}
(B.rapports || []).forEach((R) => {
  ["id", "titre", "organisation", "annee", "perimetre", "source", "analyse", "revendications"].forEach((k) => { if (R[k] === undefined) err(R.id + " : champ " + k + " manquant"); });
  (R.revendications || []).forEach((rev) => {
    const w = R.id + "/" + rev.id;
    ["enonce", "court", "pages", "domaine", "preuves", "lectures"].forEach((k) => { if (rev[k] === undefined) err(w + " : champ " + k + " manquant"); });
    if (DIDS.indexOf(rev.domaine) < 0) err(w + " : domaine inconnu " + rev.domaine);
    CIDS.forEach((c) => {
      const l = rev.lectures && rev.lectures[c];
      if (!l) return err(w + " : lecture " + c + " manquante");
      if (l.options) { if (!l.options.length) err(w + "/" + c + " : options vides"); l.options.forEach((o) => { if (!o.id || !o.libelle) err(w + "/" + c + " : option sans id ou libellé"); checkReading(w + "/" + c + "/" + o.id, o); }); }
      else checkReading(w + "/" + c, l);
    });
  });
});

if (errors.length) { console.error("ÉCHEC\n- " + errors.join("\n- ")); process.exit(1); }
console.log("Données conformes : 55 croisements (" + count.Proposed + " proposés, " + count.Exploratory + " exploratoires, " + count.Open + " ouverts), " + (B.rapports || []).length + " rapport(s).");
