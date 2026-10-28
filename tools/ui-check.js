/* Vérifications dans un navigateur, d'après les critères de réception du brief v2 : node tools/ui-check.js
   (nécessite Playwright et Chromium). SHOTS=dossier pour enregistrer des captures. */
const path = require("path");
const fs = require("fs");
const os = require("os");
const http = require("http");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;
const root = path.join(__dirname, "..");
const url = "file://" + path.join(root, "index.html");
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, "data", f), "utf8"));
const C = read("02_CONTENU_MODELE_v2.json");
const IL = read("illustrations.json");
const AT = read("rapports/aides-techniques-domicile.json");
const RS = read("rapports/resante-vous-2024.json");
const shots = process.env.SHOTS || null;
let fails = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "ECHEC ") + m); if (!c) fails++; };
const info = (m) => console.log("info " + m);
const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
const conc = (id) => C.conceptions.filter((c) => c.id === id)[0];
const issueLib = (id) => C.issues.valeurs.filter((v) => v.id === id)[0].libelle;
const VIDS = C.volets.map((v) => v.id);
const FORBIDDEN = /\brubriques?\b|\bfonctions?\b|\bétayée?s?\b|à étayer|\bpérimètres?\b/i;

/* Un faisceau traverse-t-il un texte ? On échantillonne chaque trajet et on teste les rectangles des nœuds texte visibles. */
async function raysOverText(page) {
  return page.evaluate(() => {
    const rects = [];
    const scene = document.querySelector(".optic");
    const walker = document.createTreeWalker(scene, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode, pe = n.parentElement;
      if (!n.textContent.trim() || pe.closest(".rays-overlay") || (pe.checkVisibility && !pe.checkVisibility({ visibilityProperty: true, opacityProperty: true }))) continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      [...rg.getClientRects()].forEach((r) => { if (r.width > 0) rects.push({ t: n.textContent.trim().slice(0, 30), l: r.left + 2, r: r.right - 2, tp: r.top + 2, b: r.bottom - 2 }); });
    }
    const hits = new Set();
    document.querySelectorAll(".rays-overlay path").forEach((p) => {
      const s = p.ownerSVGElement.getBoundingClientRect(); const L = p.getTotalLength();
      for (let i = 0; i <= L; i += 2) {
        const q = p.getPointAtLength(i), x = q.x + s.left, y = q.y + s.top;
        rects.forEach((t) => { if (x > t.l && x < t.r && y > t.tp && y < t.b) hits.add(t.t); });
      }
    });
    return [...hits];
  });
}
async function textOverlaps(page, sel) {
  return page.$$eval(sel, (els) => {
    const r = els.filter((e) => e.getBoundingClientRect().width > 0).map((e) => ({ t: e.textContent.trim().slice(0, 24), b: e.getBoundingClientRect() }));
    const out = [];
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
      const a = r[i].b, c = r[j].b;
      if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) out.push(r[i].t + " / " + r[j].t);
    }
    return out;
  });
}
/* Texte affiché par l'interface, détails ouverts ; les textes des cellules et des exemples complémentaires (repris de 02) sont relevés à part. */
async function vocab(page) {
  return page.evaluate((src) => {
    const re = new RegExp(src, "i");
    document.querySelectorAll("details").forEach((d) => { d.open = true; });
    const own = [], data = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode, m = n.textContent.match(re);
      if (!m) continue;
      (n.parentElement.closest(".cell-detail, details.other") ? data : own).push(m[0] + " : " + n.textContent.trim().slice(0, 60));
    }
    return { own, data };
  }, FORBIDDEN.source);
}
const pressed = (page) => page.$$eval(".c-btn[aria-pressed=true]", (b) => b.map((x) => x.dataset.c));
const valuetext = (page) => page.getAttribute("#model .dial", "aria-valuetext");
async function accueilShows(page, id, label) {
  const c = conc(id);
  ok(JSON.stringify(await pressed(page)) === JSON.stringify([id]), label + " : bouton " + c.nom + " sélectionné");
  ok((await valuetext(page)) === c.nom_court, label + " : le prisme est tourné vers " + c.nom_court);
  ok(norm(await page.textContent("#c-reason")) === c.raison_courte, label + " : raison de valoriser affichée");
  const f = await page.$$eval(".rubs .rub-f", (p) => p.map((x) => x.textContent));
  ok(JSON.stringify(f) === JSON.stringify(VIDS.map((v) => c.volets[v])), label + " : quatre volets de " + c.nom);
}
/* lecture attendue pour une version du cas construit */
function lect(cid, version) {
  const base = AT.enonces[0].lectures[cid];
  const v = version === "B" ? AT.versions[0] : null;
  const u = v && v.lectures_mises_a_jour.E1[cid];
  return u ? Object.assign({}, base, u) : base;
}
async function cardShows(page, side, cid, version, L) {
  const l = lect(cid, version);
  const card = '.r-card[data-side="' + side + '"]';
  ok((await page.getAttribute(card, "data-c")) === cid, L + " carte " + (side + 1) + " : " + conc(cid).nom);
  const t = norm(await page.textContent(card + " .rc-body"));
  ok([l.affirmation, l.pourquoi].every((x) => t.includes(x)) && t.includes(issueLib(l.issue)), L + " carte " + cid + " (" + version + ") : affirmation, issue, pourquoi");
  if (l.ce_qui_changerait_l_issue) ok(t.includes(l.ce_qui_changerait_l_issue), L + " carte " + cid + " : ce qui changerait l'issue");
  else ok(!t.includes("Ce qui changerait"), L + " carte " + cid + " : rubrique vide masquée");
}

/* serveur statique minimal, pour lire data/rapports/ par fetch comme sur le site publié */
function serve(dir) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png" };
  return new Promise((res) => {
    const s = http.createServer((q, r) => {
      const p = path.join(dir, decodeURIComponent(q.url.split("?")[0]).replace(/^\/$/, "/index.html"));
      if (!p.startsWith(dir) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" });
      fs.createReadStream(p).pipe(r);
    }).listen(0, "127.0.0.1", () => res(s));
  });
}

(async () => {
  const browser = await chromium.launch({ executablePath: exe });

  for (const vp of [{ n: "ordinateur", f: "ordinateur", w: 1320, h: 900 }, { n: "tablette", f: "tablette", w: 768, h: 1024 }, { n: "téléphone", f: "mobile", w: 375, h: 760 }]) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    const L = "[" + vp.n + "]";
    const shot = async (name) => { if (!shots) return; await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.screenshot({ path: path.join(shots, name + "-" + vp.f + ".png"), fullPage: true }); };

    /* ---------- accueil ---------- */
    await page.goto(url + "#/"); await page.waitForTimeout(500);
    ok(norm(await page.textContent("#page-title")) === C.accueil.titre, L + " accueil : titre");
    ok(norm(await page.textContent(".m-lead")) === C.accueil.sous_titre, L + " accueil : sous-titre");
    const chainK = await page.$$eval(".chain .chain-k", (e) => e.map((x) => x.textContent.slice(1)));
    ok(JSON.stringify(chainK) === JSON.stringify(C.accueil.chaine), L + " accueil : chaîne à quatre maillons");
    ok(norm(await page.textContent(".c-meta")) === C.accueil.metaphore, L + " accueil : phrase sur le prisme");
    const body = norm(await page.textContent("#model"));
    ok(/garantie/i.test(body) && /issue/i.test(body), L + " accueil : les mots « garantie » et « issue » sont visibles");
    ok(await page.isVisible(".result") && norm(await page.textContent(".result")).includes(C.accueil.resultat_en_une_phrase), L + " accueil : résultat lisible sans cliquer");
    const ctas = await page.$$eval(".m-cta a", (a) => a.map((x) => [x.getAttribute("href"), x.textContent]));
    ok(JSON.stringify(ctas) === JSON.stringify([["#/illustrations", C.accueil.cta_illustrations], ["#/rapports", C.accueil.cta_rapports]]), L + " accueil : deux actions");
    await accueilShows(page, "S", L + " défaut");
    ok((await page.$$(".c-b .rubs .rub")).length === 4, L + " les quatre volets sont groupés");
    /* issues nommées, définition au clavier */
    await page.focus('.ik-btn[aria-describedby="home-laissee_a_justifier"]');
    const tip = await page.$eval("#home-laissee_a_justifier", (t) => [getComputedStyle(t).visibility, t.textContent]);
    ok(tip[0] === "visible" && tip[1] === C.issues.valeurs[2].definition, L + " définition de « Laissée à justifier » au focus clavier");
    if (vp.n === "ordinateur") {
      await page.hover('.ik-btn[aria-describedby="home-autorisee"]');
      ok((await page.$eval("#home-autorisee", (t) => getComputedStyle(t).visibility)) === "visible", L + " définition au survol");
    }
    /* choix de conception : boutons, faces, clavier */
    await page.click('.c-btn[data-c="M"]'); await page.waitForTimeout(750);
    await accueilShows(page, "M", L + " clic Maximisatrice");
    await page.click('.rub[data-v="preuve"] summary');
    ok(norm(await page.textContent('.rub[data-v="preuve"] .rub-q')) === C.volets[2].question, L + " volet Preuve déplié : question");
    await page.click('.c-btn[data-c="V"]'); await page.waitForTimeout(750);
    ok(await page.$eval('.rub[data-v="preuve"] details', (d) => d.open), L + " le volet déplié reste ouvert");
    await page.click('#model .p-lab[data-face="N"]'); await page.waitForTimeout(750);
    await accueilShows(page, "N", L + " clic sur la face Normative");
    await page.focus("#model .dial"); await page.keyboard.press("2"); await page.waitForTimeout(750);
    await accueilShows(page, "I", L + " touche 2 sur le prisme");
    await page.keyboard.press("Home"); await page.waitForTimeout(750);
    await accueilShows(page, "S", L + " touche Début");
    let hits = await raysOverText(page);
    ok(hits.length === 0, L + " accueil : aucun faisceau sur un texte" + (hits.length ? " (" + hits.join(" | ") + ")" : ""));
    let ov = await textOverlaps(page, ".chain-k, .c-btn, .c-reason, .c-src, .c-meta, .g-t, .rub-t, .rub-term, .rub-f, .judge-out, .p-lab");
    ok(ov.length === 0, L + " accueil : aucun chevauchement de textes" + (ov.length ? " (" + ov.join(" | ") + ")" : ""));
    ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= vp.w, L + " accueil : pas de défilement horizontal");
    await shot("accueil");

    /* ---------- sources ---------- */
    await page.click("#nav-sources");
    const dt = norm(await page.textContent(".drawer"));
    ok(Object.values(C.mentions).every((m) => dt.includes(m)), L + " sources : mentions (typologie, domaines, synthèse, IA)");
    ok(C.propositions.every((p) => dt.includes(p.texte)), L + " sources : propositions P1 et P2");
    ok((await page.$$(".lexique tbody tr")).length === C.lexique.length, L + " sources : lexique en tableau (" + C.lexique.length + " termes)");
    ok(dt.includes("37 spécifications proposées, 12 pistes exploratoires, 6 relations ouvertes"), L + " sources : effectifs 37 / 12 / 6");
    ok(!(await page.$eval("#explorer", (d) => d.open)), L + " explorateur des cellules fermé par défaut");
    await page.click("#explorer summary");
    ok((await page.$$(".cell-btn")).length === 55, L + " explorateur : 55 cellules");
    await page.click('.cell-btn[data-cell="I07"]');
    const cell = C.repertoire.cellules.filter((c) => c.id === "I07")[0];
    const cd = norm(await page.textContent(".cell-detail"));
    ok([cell.formulation_courte, cell.raison_de_valoriser, cell.critere_propose, cell.question_evaluative, cell.regle_pour_conclure, "Relation ouverte"].every((t) => cd.includes(t)), L + " explorateur : cellule I07 et son statut");
    const hrefs = await page.$$eval(".drawer a", (a) => a.map((x) => x.getAttribute("href")));
    ok(hrefs.length > 0 && hrefs.every((h) => /^https:\/\/doi\.org\/10\./.test(h)), L + " sources : liens DOI");
    const vs = await vocab(page);
    ok(vs.own.length === 0, L + " volet des sources : vocabulaire à jour" + (vs.own.length ? " (" + vs.own.join(" | ") + ")" : ""));
    if (vs.data.length) info(L + " termes à relire dans les textes de la cellule I07 : " + vs.data.join(" | "));
    await page.keyboard.press("Escape");
    ok(!(await page.$(".drawer")) && JSON.stringify(await pressed(page)) === '["S"]', L + " Échap ferme le volet ; le choix est conservé");
    const va = await vocab(page);
    ok(va.own.length === 0, L + " accueil : vocabulaire à jour" + (va.own.length ? " (" + va.own.join(" | ") + ")" : ""));

    /* ---------- illustrations ---------- */
    await page.goto(url + "#/illustrations"); await page.waitForTimeout(500);
    ok(norm(await page.textContent("#page-title")) === IL.titre && norm(await page.textContent(".i-head .tag-built")) === IL.mention, L + " illustrations : titre et mention");
    ok(!(await page.$(".dos-band")) && norm(await page.textContent(".dos-dl")).includes(AT.dossier.lacunes[0]), L + " ouverture sur le dossier A");
    await cardShows(page, 0, "S", "A", L);
    await cardShows(page, 1, "I", "A", L);
    const cmp = norm(await page.textContent("#comparaison"));
    ok(cmp.includes("est autorisée") && cmp.includes("est laissée à justifier") && cmp.includes("La différence tient à la relation entre le transfert et ce que la personne valorise"), L + " phrase de comparaison (Ciblée / Individualiste, A)");
    ok((await page.getAttribute('.r-card[data-side="1"] .pk-btn[data-c="S"]', "aria-disabled")) === "true", L + " la conception choisie à gauche est indisponible à droite");
    /* les cinq lectures */
    for (const cid of ["M", "V", "N"]) {
      await page.click('.r-card[data-side="0"] .pk-btn[data-c="' + cid + '"]'); await page.waitForTimeout(150);
      await cardShows(page, 0, cid, "A", L);
    }
    await page.click('.r-card[data-side="0"] .pk-btn[data-c="M"]'); await page.waitForTimeout(150);
    const mi = await page.$$eval('.r-card[data-side="0"] .issues-multi li', (li) => li.map((x) => x.textContent));
    ok(mi.length === 2 && /Bénéfice.*Délimitée/.test(mi[0]) && /Supériorité.*Laissée à justifier/.test(mi[1]), L + " Maximisatrice : deux issues affichées");
    ok(await page.evaluate(() => document.activeElement && document.activeElement.matches('.pk-btn[data-c="M"]')), L + " le focus reste sur le bouton choisi");
    await page.click('.r-card[data-side="0"] .pk-btn[data-c="S"]'); await page.waitForTimeout(150);
    hits = await raysOverText(page);
    ok(hits.length === 0, L + " illustrations : aucun trait sur un texte" + (hits.length ? " (" + hits.join(" | ") + ")" : ""));
    await shot("illustrations-A");
    /* dossier B */
    await page.click('.r-card[data-side="1"] .reasoning summary');
    await page.click("#add-info"); await page.waitForTimeout(300);
    const dosB = norm(await page.textContent(".dos-dl"));
    ok(norm(await page.textContent(".dos-band")) === AT.versions[0].bandeau && dosB.includes(AT.versions[0].information_ajoutee) && !dosB.includes(AT.dossier.lacunes[0]), L + " B : bandeau, information ajoutée, lacune comblée retirée");
    await cardShows(page, 0, "S", "B", L);
    await cardShows(page, 1, "I", "B", L);
    ok(norm(await page.textContent('.r-card[data-side="1"] .upd')) === "Issue actualisée" && norm(await page.textContent('.r-card[data-side="0"] .upd')) === "Issue inchangée", L + " B : l'issue individualiste devient autorisée, la ciblée ne change pas");
    ok(norm(await page.textContent(".i-teach")) === AT.versions[0].enseignement, L + " B : phrase d'enseignement");
    ok(await page.$eval('.r-card[data-side="1"] .reasoning', (d) => d.open), L + " B : les volets dépliés restent ouverts");
    await page.click("#example-sources");
    ok(norm(await page.textContent(".drawer")).includes(AT.limites), L + " sources et prémisses de l'exemple");
    await page.keyboard.press("Escape");
    ok(!!(await page.$(".dos-band")), L + " après le volet, le dossier B est conservé");
    await shot("illustrations-B");
    await page.click("#back-info"); await page.waitForTimeout(300);
    ok(!(await page.$(".dos-band")) && norm(await page.textContent(".dos-dl")).includes(AT.dossier.lacunes[0]), L + " retour : dossier A rétabli");
    await cardShows(page, 1, "I", "A", L);
    const vi = await vocab(page);
    ok(vi.own.length === 0, L + " illustrations : vocabulaire à jour" + (vi.own.length ? " (" + vi.own.join(" | ") + ")" : ""));
    if (vi.data.length) info(L + " termes à relire dans les exemples complémentaires : " + vi.data.join(" | "));
    ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= vp.w, L + " illustrations : pas de défilement horizontal");

    /* ---------- rapports ---------- */
    await page.click('a[href="#/rapports"].tab'); await page.waitForTimeout(500);
    ok(norm(await page.textContent(".rp-mention")).startsWith("Les analyses affichées ont été produites hors du site"), L + " rapports : mention fixe");
    ok((await page.$eval("#rapport-select", (s) => s.value)) === "resante-vous-2024", L + " rapports : ReSanté-Vous au chargement");
    const opts = await page.$$eval("#rapport-select option", (o) => o.map((x) => x.textContent));
    ok(opts.length === 2 && opts.some((o) => o.includes("Illustration construite")) && opts.some((o) => o.includes("Rapport publié, analyse documentaire")), L + " rapports : liste avec titre, organisation, année et mention");
    ok((await page.getAttribute(".rp-more", "aria-expanded")) === "false", L + " dossier replié par défaut");
    await page.click(".rp-more");
    const rd = norm(await page.textContent(".rp-dos"));
    ok(RS.dossier.observations.every((o) => rd.includes(o)) && RS.dossier.lacunes.every((o) => rd.includes(o)) && !rd.includes("Standard"), L + " dossier déplié ; standard absent masqué");
    const pk = await page.$$eval(".rp-pickers .pk-btn[aria-pressed=true]", (b) => b.map((x) => x.dataset.c));
    ok(JSON.stringify(pk) === '["I","S"]', L + " deux conceptions par défaut : Individualiste et Ciblée");
    ok((await page.$$(".rp-row")).length === RS.enonces.length, L + " une ligne par énoncé");
    const e1 = norm(await page.textContent("#enonce-E1"));
    ok(e1.includes(RS.enonces[0].texte) && e1.includes("p. 44") && e1.includes(RS.enonces[0].lectures.I.affirmation) && e1.includes(RS.enonces[0].lectures.S.affirmation), L + " niveau 1 : énoncé, page, affirmations");
    ok(norm(await page.textContent("#enonce-E1 .rp-cmp")).includes("Les deux garanties exigent ici les mêmes relations."), L + " niveau 1 : phrase de comparaison");
    ok((await page.$$eval("#enonce-E2 .rp-none", (e) => e.map((x) => x.textContent))).join("|") === "Non examinée sous cette conception|Non examinée sous cette conception", L + " E2 : « Non examinée sous cette conception »");
    await page.click("#enonce-E1 details.lvl:nth-of-type(1) summary");
    const lv = await page.$$eval("#enonce-E1 table.lv tbody tr", (r) => r.length);
    ok(lv === 6, L + " niveau 2 : référence, quatre volets, ce qui changerait l'issue");
    await page.click("#enonce-E1 details.lvl:nth-of-type(2) summary");
    ok(norm(await page.textContent("#enonce-E1")).includes(RS.enonces[0].passages[0].extrait) && norm(await page.textContent("#enonce-E1")).includes(RS.enonces[0].lectures.S.premisse_ajoutee), L + " niveau 3 : passage et prémisse");
    /* changer la seconde conception */
    await page.click('.rp-pickers .picker:nth-child(2) .pk-btn[data-c="N"]'); await page.waitForTimeout(200);
    const e2 = norm(await page.textContent("#enonce-E2"));
    ok(e2.includes(RS.enonces[1].lectures.N.affirmation) && e2.includes("Laissée à justifier"), L + " E2 sous la conception normative");
    ok(await page.$eval("#enonce-E1 details.lvl:nth-of-type(1)", (d) => d.open), L + " les niveaux dépliés restent ouverts");
    const pf = norm(await page.textContent(".profil"));
    ok(pf.includes("Ces fréquences décrivent les justifications du rapport, pas la quantité de valeur produite ni la qualité des appuis.") && (await page.$$(".pf-seg")).length === 2 && pf.includes("Individualiste : 1") && pf.includes("Lectures concurrentes"), L + " profil : comptes, barre, lectures concurrentes, note fixe");
    ok(!/\bnull\b|undefined/.test(await page.textContent("main")), L + " aucun « null » affiché");
    const vr = await vocab(page);
    ok(vr.own.length === 0, L + " rapports : vocabulaire à jour" + (vr.own.length ? " (" + vr.own.join(" | ") + ")" : ""));
    ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= vp.w, L + " rapports : pas de défilement horizontal");
    await page.goto(url + "#/rapports"); await page.waitForTimeout(400);
    await shot("rapports");
    await page.selectOption("#rapport-select", "aides-techniques-domicile"); await page.waitForTimeout(300);
    ok((await page.evaluate(() => location.hash)) === "#/rapports/aides-techniques-domicile" && norm(await page.textContent(".rp-dos")).includes(AT.dossier.action), L + " changement de rapport et lien stable");
    ok(JSON.stringify(await page.$$eval(".rp-pickers .pk-btn[aria-pressed=true]", (b) => b.map((x) => x.dataset.c))) === '["S","I"]', L + " cas construit : Ciblée et Individualiste par défaut");
    await page.goto(url + "#/rapports/resante-vous-2024"); await page.waitForTimeout(300);
    ok((await page.$eval("#rapport-select", (s) => s.value)) === "resante-vous-2024", L + " lien direct vers un rapport");

    /* anciens liens */
    await page.goto(url + "#/illustrations/C05"); await page.waitForTimeout(300);
    ok(await page.isVisible(".notice") && (await page.evaluate(() => location.hash)) === "#/illustrations", L + " ancien lien de cas : entrée des illustrations avec indication");
    await page.goto(url + "#/catalogue/x"); await page.waitForTimeout(300);
    ok(await page.isVisible(".notice") && !!(await page.$("#model")), L + " ancienne rubrique : entrée de l'accueil avec indication");

    ok(errs.length === 0, L + " aucune erreur JavaScript" + (errs.length ? " (" + errs.join(" | ") + ")" : ""));
    await page.close();
  }

  /* animations réduites */
  const rp = await browser.newPage({ viewport: { width: 1320, height: 900 }, reducedMotion: "reduce" });
  await rp.goto(url + "#/"); await rp.waitForTimeout(300);
  await rp.click('.c-btn[data-c="N"]');
  ok((await valuetext(rp)) === conc("N").nom_court, "[animations réduites] le prisme suit le bouton immédiatement");
  await rp.focus("#model .dial"); await rp.keyboard.press("ArrowLeft");
  ok((await valuetext(rp)) === conc("V").nom_court && JSON.stringify(await pressed(rp)) === '["V"]', "[animations réduites] le clavier tourne le prisme et sélectionne le bouton");
  await rp.close();

  /* ajout d'un rapport par simple dépôt d'un fichier et mise à jour de l'index (copie servie en HTTP) */
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prisme-"));
  ["index.html", "css", "js", "data"].forEach((p) => fs.cpSync(path.join(root, p), path.join(tmp, p), { recursive: true }));
  const extra = JSON.parse(JSON.stringify(RS));
  extra.id = "essai-depot"; extra.titre = "Rapport d’essai (contrôle automatique)";
  fs.writeFileSync(path.join(tmp, "data/rapports/essai-depot.json"), JSON.stringify(extra));
  const idx = JSON.parse(fs.readFileSync(path.join(tmp, "data/rapports/index.json"), "utf8"));
  idx.fichiers.push("essai-depot.json", "fichier-absent.json");
  fs.writeFileSync(path.join(tmp, "data/rapports/index.json"), JSON.stringify(idx));
  const server = await serve(tmp);
  const hp = await browser.newPage({ viewport: { width: 1320, height: 900 } });
  const herrs = [];
  hp.on("pageerror", (e) => herrs.push(e.message));
  await hp.goto("http://127.0.0.1:" + server.address().port + "/#/rapports"); await hp.waitForTimeout(800);
  const hopts = await hp.$$eval("#rapport-select option", (o) => o.map((x) => x.value));
  ok(JSON.stringify(hopts) === '["resante-vous-2024","aides-techniques-domicile","essai-depot"]', "[HTTP] un fichier déposé et ajouté à l'index apparaît sans modification du code ; un fichier absent est ignoré");
  await hp.selectOption("#rapport-select", "essai-depot"); await hp.waitForTimeout(200);
  ok((await hp.$$(".rp-row")).length === extra.enonces.length && herrs.length === 0, "[HTTP] le rapport déposé s'affiche");
  await hp.close();
  server.close();
  fs.rmSync(tmp, { recursive: true, force: true });

  await browser.close();
  console.log(fails ? fails + " échec(s)" : "Tous les contrôles passent.");
  process.exit(fails ? 1 : 0);
})();
