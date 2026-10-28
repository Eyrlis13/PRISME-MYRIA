/*
 * Contrôle des données : node tools/verify-data.js
 * Vérifie le contenu du modèle (02), les références (04), les illustrations et chaque fichier de data/rapports/.
 * À lancer après le dépôt d'un nouveau rapport : les erreurs bloquent, les avertissements signalent un point à relire.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dir = path.join(__dirname, "..", "data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const errors = [], warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const C = read("02_CONTENU_MODELE_v2.json");
const S = read("04_SOURCES_ET_ATTRIBUTIONS.json");
const IL = read("illustrations.json");
const SCHEMA = read("rapports/schema.json");
const index = read("rapports/index.json");

const IDS = ["M", "I", "S", "V", "N"];
const VOLETS = ["qualification", "portee", "preuve", "regle"];
const ISSUES = ["autorisee", "delimitee", "laissee_a_justifier"];
const str = (v) => typeof v === "string" && v.trim().length > 0;

/* ---------- modèle ---------- */
if (C.conceptions.map((c) => c.id).join("") !== IDS.join("")) err("conceptions attendues : M I S V N");
C.conceptions.forEach((c) => {
  ["nom", "nom_court", "raison_courte", "definition"].forEach((k) => { if (!str(c[k])) err("conception " + c.id + " : " + k + " manquant"); });
  VOLETS.forEach((v) => { if (!str(c.volets[v])) err("conception " + c.id + " : volet " + v + " manquant"); });
});
if (C.volets.map((v) => v.id).join(",") !== VOLETS.join(",")) err("volets attendus : " + VOLETS.join(", "));
if (C.issues.valeurs.map((v) => v.id).join(",") !== ISSUES.join(",")) err("issues attendues : " + ISSUES.join(", "));
if (C.accueil.chaine.length !== 4) err("la chaîne de l'accueil doit compter quatre maillons");
if (!C.lexique.some((l) => l[0] === "Garantie")) err("le lexique doit définir « Garantie »");
const cells = C.repertoire.cellules;
const cellIds = new Set(cells.map((c) => c.id));
if (cells.length !== C.repertoire.nombre_cellules || cellIds.size !== cells.length) err("répertoire : nombre de cellules ou identifiants en double");
const nb = (s) => cells.filter((c) => c.statut === s).length;
if (nb("proposee") !== C.repertoire.specifications_proposees) err("répertoire : " + nb("proposee") + " cellules proposées, " + C.repertoire.specifications_proposees + " annoncées");
if (nb("exploratoire") !== C.repertoire.pistes_exploratoires) err("répertoire : " + nb("exploratoire") + " pistes exploratoires, " + C.repertoire.pistes_exploratoires + " annoncées");
const ouvertes = cells.filter((c) => c.statut === "ouverte").map((c) => c.id).join(",");
if (ouvertes !== C.repertoire.relations_ouvertes.join(",")) err("répertoire : relations ouvertes " + ouvertes + " ≠ " + C.repertoire.relations_ouvertes.join(","));
IDS.forEach((cid) => C.domaines.forEach((d) => {
  if (cells.filter((c) => c.conception === cid && c.domaine_code === d.code).length !== 1) err("répertoire : cellule " + cid + d.code + " absente ou en double");
}));

/* ---------- références ---------- */
S.references.forEach((r) => {
  if (!/^10\.\d{4,9}\//.test(r.doi || "")) err("DOI absent ou mal formé : " + r.id);
  if (r.url !== "https://doi.org/" + r.doi) err("lien DOI incohérent : " + r.id);
});
const refIds = new Set(S.references.map((r) => r.id));

/* ---------- rapports ---------- */
const tpl = SCHEMA.schema.comparaison_template;
["La différence tient à", "Ce qui changerait l’issue :", "Les deux garanties exigent ici les mêmes relations."].forEach((t) => {
  if (tpl.indexOf(t) < 0) err("gabarit de comparaison : « " + t + " » introuvable dans schema.json (le site l'emploie)");
});
if (!Array.isArray(index.fichiers) || !index.fichiers.length) err("data/rapports/index.json : liste « fichiers » vide");
const rapports = [];
(index.fichiers || []).forEach((f) => {
  const where = "rapports/" + f;
  let r;
  try { r = read(where); } catch (e) { return err(where + " : illisible (" + e.message + ")"); }
  rapports.push(r);
  if (r.id + ".json" !== f) err(where + " : l'identifiant « " + r.id + " » ne correspond pas au nom du fichier");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.id || "")) err(where + " : identifiant non conforme (minuscules, chiffres et tirets)");
  ["titre", "organisation", "annee", "source", "statut_affichage"].forEach((k) => { if (!str(r[k])) err(where + " : champ « " + k + " » manquant"); });
  if (["cas_construit", "rapport_publie"].indexOf(r.type) < 0) err(where + " : type attendu cas_construit ou rapport_publie");
  const d = r.dossier || {};
  if (!str(d.action) || !str(d.objectif)) err(where + " : dossier sans action ou objectif");
  if (d.standard !== null && d.standard !== undefined && !str(d.standard)) err(where + " : standard vide (mettre null s'il n'existe pas)");
  ["observations", "lacunes"].forEach((k) => { if (!Array.isArray(d[k])) err(where + " : dossier." + k + " doit être une liste"); });
  if (!Array.isArray(r.enonces) || !r.enonces.length) return err(where + " : aucun énoncé");
  const eids = new Set();
  r.enonces.forEach((e) => {
    const we = where + " " + e.id;
    if (!str(e.id) || eids.has(e.id)) err(we + " : identifiant d'énoncé manquant ou en double");
    eids.add(e.id);
    if (!str(e.texte)) err(we + " : texte manquant");
    if (!Array.isArray(e.passages)) err(we + " : passages doit être une liste (vide si aucun)");
    (e.passages || []).forEach((p) => { if (!str(p.extrait)) err(we + " : passage sans extrait"); });
    const keys = Object.keys(e.lectures || {});
    if (!keys.length) err(we + " : aucune lecture");
    keys.forEach((cid) => {
      const l = e.lectures[cid], wl = we + "/" + cid;
      if (IDS.indexOf(cid) < 0) return err(wl + " : conception inconnue");
      if (!cellIds.has(l.cellule)) err(wl + " : cellule inconnue « " + l.cellule + " »");
      else if (l.cellule[0] !== cid) err(wl + " : la cellule " + l.cellule + " n'appartient pas à cette conception");
      ["affirmation", "reference_de_valeur", "pourquoi"].forEach((k) => { if (!str(l[k])) err(wl + " : « " + k + " » manquant"); });
      VOLETS.forEach((v) => { if (!l.volets || !str(l.volets[v])) err(wl + " : volet « " + v + " » manquant"); });
      if (ISSUES.indexOf(l.issue) < 0) err(wl + " : issue « " + l.issue + " » inconnue");
      if (l.issue !== "autorisee" && !str(l.relation_manquante)) warn(wl + " : issue non autorisée sans relation manquante ; la phrase de comparaison restera incomplète");
      ["relation_manquante", "ce_qui_changerait_l_issue", "premisse_ajoutee"].forEach((k) => { if (l[k] !== null && l[k] !== undefined && !str(l[k])) err(wl + " : « " + k + " » vide (mettre null)"); });
      (l.issues_detaillees || []).forEach((x) => { if (!str(x.porte_sur) || ISSUES.indexOf(x.issue) < 0) err(wl + " : issues_detaillees mal formées"); });
    });
    const non = e.non_examine_sous || [];
    non.forEach((cid) => { if (keys.indexOf(cid) >= 0) err(we + " : " + cid + " à la fois lue et « non examinée »"); });
    const tous = keys.concat(non).sort().join("");
    if (tous !== IDS.slice().sort().join("")) warn(we + " : lectures et « non examinée » ne couvrent pas les cinq conceptions");
  });
  (r.versions || []).forEach((v) => {
    const wv = where + " version " + v.id;
    if (!str(v.id) || !str(v.information_ajoutee)) err(wv + " : identifiant ou information ajoutée manquants");
    Object.keys(v.lectures_mises_a_jour || {}).forEach((eid) => {
      const e = r.enonces.filter((x) => x.id === eid)[0];
      if (!e) return err(wv + " : énoncé inconnu " + eid);
      Object.keys(v.lectures_mises_a_jour[eid]).forEach((cid) => {
        if (!e.lectures[cid]) err(wv + " : mise à jour d'une lecture absente " + eid + "/" + cid);
        const u = v.lectures_mises_a_jour[eid][cid];
        if (u.issue && ISSUES.indexOf(u.issue) < 0) err(wv + " : issue inconnue " + u.issue);
      });
    });
  });
  const pf = r.profil;
  if (!pf) warn(where + " : pas de profil");
  else {
    ["affirmations_examinees", "rattachees", "indeterminees"].forEach((k) => { if (typeof pf[k] !== "number") err(where + " : profil." + k + " doit être un nombre"); });
    Object.keys(pf.parts || {}).forEach((k) => { if (IDS.indexOf(k) < 0 || typeof pf.parts[k] !== "number") err(where + " : profil.parts mal formé (" + k + ")"); });
    (pf.concurrentes || []).forEach((c) => { if (!eids.has(c.enonce)) err(where + " : lecture concurrente sur un énoncé inconnu " + c.enonce); });
  }
});
if (rapports.map((r) => r.id).indexOf(index.par_defaut) < 0) err("index.json : rapport par défaut « " + index.par_defaut + " » absent de la liste");

/* ---------- illustrations ---------- */
if (rapports.map((r) => r.id).indexOf(IL.cas) < 0) err("illustrations.json : le cas « " + IL.cas + " » n'est pas listé dans data/rapports/index.json");
if (IL.couple_initial.length !== 2 || IL.couple_initial.some((c) => IDS.indexOf(c) < 0)) err("illustrations.json : couple initial invalide");
IL.complementaires.forEach((e) => {
  (e.lectures || e.affirmations).forEach((l) => { if (ISSUES.indexOf(l.issue) < 0) err("exemple " + e.id + " : issue manquante ou inconnue"); });
  e.sources.forEach((id) => { if (!refIds.has(id)) err("exemple " + e.id + " : référence inconnue " + id); });
});

/* ---------- copie locale ---------- */
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(dir, "prisme-data.js"), "utf8"), sandbox);
const expected = { modele: C, illustrations: IL, sources: S, rapports: { index: index, fichiers: rapports } };
if (JSON.stringify(sandbox.window.PRISME_DATA) !== JSON.stringify(expected)) err("data/prisme-data.js n'est pas à jour : lancer node tools/build-data.js (copie utilisée seulement à l'ouverture locale)");

warnings.forEach((w) => console.warn("avertissement : " + w));
if (errors.length) { console.error(errors.map((e) => "ERREUR : " + e).join("\n")); process.exit(1); }
console.log("Données conformes : 5 conceptions × 4 volets, " + cells.length + " cellules (" + nb("proposee") + " / " + nb("exploratoire") + " / " + nb("ouverte") + "), " +
  S.references.length + " références avec DOI, " + rapports.length + " rapports (" + rapports.map((r) => r.id).join(", ") + ").");
