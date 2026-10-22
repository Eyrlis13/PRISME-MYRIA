/* Contrôle d'intégrité et de fidélité des données : node tools/verify-data.js */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const vm = require("vm");

const dir = path.join(__dirname, "..", "data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const C = read("02_CONTENU_INTERFACE.json");
const M = read("03_MODELE_SCIENTIFIQUE_REFERENCE.json");
const S = read("04_SOURCES_ET_ATTRIBUTIONS.json");
const errors = [];
const err = (m) => errors.push(m);
const eq = (a, b, where) => { if (a !== b) err(where + " : « " + a + " » ≠ « " + b + " »"); };

/* le script chargé par l'application doit correspondre aux trois fichiers */
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(dir, "prisme-data.js"), "utf8"), sandbox);
if (JSON.stringify(sandbox.window.PRISME_DATA) !== JSON.stringify({ contenu: C, modele: M, sources: S })) err("data/prisme-data.js n'est pas à jour : lancer node tools/build-data.js");

/* le modèle de référence est bien celui que désigne le fichier des sources */
const sha = crypto.createHash("sha256").update(fs.readFileSync(path.join(dir, S.source_modele.fichier))).digest("hex");
eq(sha, S.source_modele.sha256, "empreinte du modèle de référence");

/* fidélité au modèle V1 : énoncé, quatre fonctions, cinq conceptions */
eq(C.accueil.enonce_modele, M.enonce, "énoncé du modèle");
const F = C.fonctions.map((f) => f.id);
eq(F.join(","), "qualification,portee,preuve,regle", "ordre des fonctions");
C.fonctions.forEach((f, i) => {
  const r = M.rubriques[i];
  eq(f.question, r.question, "question " + f.id);
  eq(f.explication, r.contenu, "explication " + f.id);
  eq(f.arguments.join(","), r.arguments.join(","), "arguments " + f.id);
});
eq(C.conceptions.map((c) => c.id).join(""), "MISVN", "identifiants des conceptions");
C.conceptions.forEach((c, i) => {
  const row = M.conceptions[i];
  eq(c.nom, row[0], "nom " + c.id);
  F.forEach((f, j) => eq(c.rubriques[f], row[j + 1], "rubrique " + f + " de " + c.id));
  if (!c.raison_courte) err("raison courte manquante : " + c.id);
});
if (C.conceptions.filter((c) => c.id === C.accueil.conception_initiale).length !== 1) err("conception initiale inconnue");

/* références : toutes résolues, avec un DOI et un lien qui lui correspond */
const refs = new Map(S.references.map((r) => [r.id, r]));
S.references.forEach((r) => {
  if (!/^10\.\d{4,9}\//.test(r.doi || "")) err("DOI absent ou mal formé : " + r.id);
  eq(r.url, "https://doi.org/" + r.doi, "lien DOI " + r.id);
});
const cited = [].concat(
  C.illustrations.principal.sources,
  ...C.illustrations.complementaires.map((e) => e.sources),
  ...Object.values(S.appuis_par_fonction),
  C.conceptions.map((c) => c.source_typologie));
cited.forEach((id) => { if (!refs.has(id)) err("référence inconnue : " + id); });
F.forEach((f) => { if (!S.appuis_par_fonction[f]) err("appuis manquants pour " + f); });

/* démonstration guidée : A puis B, deux lectures complètes dans chaque version */
const X = C.illustrations.principal;
eq(C.illustrations.cas_initial, X.id, "cas initial");
const V = new Map(X.versions.map((v) => [v.id, v]));
const A = V.get(C.illustrations.version_initiale), B = X.versions.filter((v) => v.herite_de === A.id)[0];
if (!A || !B) err("versions A et B attendues");
else {
  [A, B].forEach((v) => C.illustrations.couple_initial.forEach((cid) => {
    const l = v.lectures.filter((x) => x.conception === cid)[0];
    if (!l) return err("lecture " + cid + " absente de la version " + v.id);
    ["affirmation", "statut_affichage", "portee", "pourquoi"].forEach((k) => { if (!l[k]) err(k + " manquant : " + v.id + "/" + cid); });
    F.forEach((f) => { if (!l.rubriques[f]) err("rubrique " + f + " manquante : " + v.id + "/" + cid); });
    if (/réfutée|établie$/i.test(l.statut_affichage)) err("verdict générique dans " + v.id + "/" + cid);
  }));
  const sent = (t) => t.match(/[^.]+\.(\s|$)/g).map((s) => s.trim());
  const sa = sent(A.faits_communs), sb = sent(B.faits_communs);
  const lacune = sa[sa.length - 1];
  if (sb.indexOf(lacune) >= 0) err("la lacune de A est encore affichée dans B");
  if (sa.slice(0, -1).join(" ") !== sb.slice(0, sa.length - 1).join(" ")) err("B ne conserve pas les faits de A");
  if (!B.bandeau || !B.information_ajoutee) err("bandeau ou information ajoutée manquant pour B");
}

/* termes proscrits dans les textes affichés */
const shown = JSON.stringify([C.accueil, C.conceptions, C.fonctions, C.illustrations, C.documentation, C.libelles]);
[/explicitée par le forum/i, /Proposition réfutée/i, /Proposition établie/i, /\bscore\b/i, /pondération/i].forEach((re) => { if (re.test(shown)) err("terme proscrit : " + re); });

/* le répertoire n'est pas publié : aucun lien vers lui dans le code */
const code = ["js/ui.js", "js/model.js", "js/illus.js", "js/main.js", "index.html"].map((f) => fs.readFileSync(path.join(__dirname, "..", f), "utf8")).join("\n");
if (/repertoire[^"]*\.(html|pdf|csv|json)/i.test(code)) err("lien vers un répertoire non publié");

if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("Données conformes : modèle V1 (" + sha.slice(0, 12) + "…), 5 conceptions × 4 fonctions, " + S.references.length + " références avec DOI, dossier A → B.");
