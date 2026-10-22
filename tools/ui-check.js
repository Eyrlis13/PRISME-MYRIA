/* Vérifications dans un navigateur, d'après les critères de réception : node tools/ui-check.js
   (nécessite Playwright et Chromium). SHOTS=dossier pour enregistrer des captures. */
const path = require("path");
const fs = require("fs");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const exe = fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;
const url = "file://" + path.join(__dirname, "..", "index.html");
const read = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", f), "utf8"));
const C = read("02_CONTENU_INTERFACE.json");
const S = read("04_SOURCES_ET_ATTRIBUTIONS.json");
const shots = process.env.SHOTS || null;
let fails = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "ECHEC ") + m); if (!c) fails++; };
const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
const conc = (id) => C.conceptions.filter((c) => c.id === id)[0];
const X = C.illustrations.principal;
const ver = (id) => X.versions.filter((v) => v.id === id)[0];
const lect = (v, cid) => ver(v).lectures.filter((l) => l.conception === cid)[0];
const FIDS = C.fonctions.map((f) => f.id);

/* Un faisceau traverse-t-il un texte ? On échantillonne chaque trajet et on teste les rectangles des nœuds texte. */
async function raysOverText(page) {
  return page.evaluate(() => {
    const rects = [];
    const scene = document.querySelector(".optic");
    const walker = document.createTreeWalker(scene, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const pe = n.parentElement;
      if (!n.textContent.trim() || pe.closest(".rays-overlay") || (pe.checkVisibility && !pe.checkVisibility())) continue;
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
const pressed = (page) => page.$$eval(".c-btn[aria-pressed=true]", (b) => b.map((x) => x.dataset.c));
const valuetext = (page) => page.getAttribute("#model .dial", "aria-valuetext");
const formulations = (page) => page.$$eval(".rubs .rub-f", (p) => p.map((x) => x.textContent));
async function accueilShows(page, id, label) {
  const c = conc(id);
  ok(JSON.stringify(await pressed(page)) === JSON.stringify([id]), label + " : bouton " + c.nom + " sélectionné");
  ok((await valuetext(page)) === c.nom, label + " : le prisme est tourné vers " + c.nom);
  ok(norm(await page.textContent("#c-reason")) === c.raison_courte, label + " : raison de valoriser affichée");
  ok(JSON.stringify(await formulations(page)) === JSON.stringify(FIDS.map((f) => c.rubriques[f])), label + " : quatre formulations de " + c.nom);
}
async function cardsShow(page, v, label) {
  for (const cid of C.illustrations.couple_initial) {
    const l = lect(v, cid);
    const card = '.r-card[data-c="' + cid + '"]';
    const txt = norm(await page.textContent(card + " .rc-body"));
    ok([l.affirmation, l.statut_affichage, l.portee, l.pourquoi].every((t) => txt.includes(t)), label + " : carte " + conc(cid).nom + " (" + v + ") conforme");
    ok(await page.isVisible(card + " .out-main"), label + " : conclusion " + cid + " visible sans dépliage");
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: exe });

  for (const vp of [{ n: "ordinateur", f: "ordinateur", w: 1320, h: 900 }, { n: "tablette", f: "tablette", w: 768, h: 1024 }, { n: "téléphone", f: "mobile", w: 375, h: 760 }]) {
    const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    const L = "[" + vp.n + "]";

    /* ---------- accueil ---------- */
    await page.goto(url + "#/"); await page.waitForTimeout(500);
    ok(norm(await page.textContent("#page-title")) === C.accueil.titre, L + " accueil : titre");
    ok(norm(await page.textContent(".m-lead")) === C.accueil.sous_titre, L + " accueil : sous-titre");
    const chainK = await page.$$eval(".chain .chain-k", (e) => e.map((x) => x.textContent.slice(1)));
    ok(JSON.stringify(chainK) === JSON.stringify(C.accueil.chaine), L + " accueil : chaîne en trois blocs");
    await accueilShows(page, C.accueil.conception_initiale, L + " défaut");
    ok((await page.$$(".c-b .rubs .rub")).length === 4 && (await page.$$(".rub")).length === 4, L + " les quatre rubriques sont groupées dans Critère et appréciation");
    const terms = await page.$$eval(".rub-term", (e) => e.map((x) => x.textContent));
    ok(JSON.stringify(terms) === JSON.stringify(C.fonctions.map((f) => f.terme)), L + " termes scientifiques en second niveau");
    ok(norm(await page.textContent(".judge-out")) === C.accueil.sortie, L + " carte Jugement justifié");
    ok(norm(await page.textContent(".db-t")) === C.accueil.dossier_commun, L + " bandeau du dossier commun");
    ok(!/forum/i.test(await page.textContent("body")), L + " aucune attribution au forum");
    ok(!/réfutée|Proposition établie|score|pondération/i.test(await page.textContent("body")), L + " aucun verdict générique ni score");

    if (vp.n === "ordinateur") {
      const jb = await page.$eval(".judge-card", (e) => e.getBoundingClientRect().bottom);
      ok(jb <= vp.h, L + " la carte Jugement justifié tient dans le premier écran (" + Math.round(jb) + " px)");
    }
    /* choix par bouton (animations actives : on attend la fin de la rotation) */
    await page.click('.c-btn[data-c="M"]'); await page.waitForTimeout(750);
    await accueilShows(page, "M", L + " clic Maximisatrice");
    /* rubrique dépliée : elle le reste après un changement de conception */
    await page.click('.rub[data-f="preuve"] summary');
    ok(norm(await page.textContent('.rub[data-f="preuve"] .rub-q')) === C.fonctions[2].question, L + " dépliage : question de la rubrique Preuve");
    await page.click('.c-btn[data-c="V"]'); await page.waitForTimeout(750);
    ok(await page.$eval('.rub[data-f="preuve"] details', (d) => d.open), L + " la rubrique dépliée reste ouverte");
    await accueilShows(page, "V", L + " clic Vertueuse");
    /* choix par le prisme : nom sur une face */
    await page.click('#model .p-lab[data-face="N"]'); await page.waitForTimeout(750);
    await accueilShows(page, "N", L + " clic sur la face Normative");
    /* clavier : prisme */
    await page.focus("#model .dial"); await page.keyboard.press("2"); await page.waitForTimeout(750);
    await accueilShows(page, "I", L + " touche 2 sur le prisme");
    await page.keyboard.press("ArrowRight"); await page.waitForTimeout(750);
    await accueilShows(page, "S", L + " flèche droite sur le prisme");
    await page.keyboard.press("Home"); await page.waitForTimeout(750);
    await accueilShows(page, C.accueil.conception_initiale, L + " touche Début");
    /* clavier : boutons */
    await page.focus('.c-btn[data-c="M"]'); await page.keyboard.press("Tab"); await page.keyboard.press("Enter"); await page.waitForTimeout(750);
    await accueilShows(page, "I", L + " Tab puis Entrée sur les boutons");

    /* sources : l'ouverture conserve le choix courant */
    await page.click("#nav-sources");
    ok(await page.isVisible(".drawer"), L + " volet des sources ouvert depuis l'accueil");
    const dtxt = norm(await page.textContent(".drawer"));
    ok([C.documentation.titre, ...C.documentation.attributions, ...C.documentation.questions_analyse, ...C.documentation.propositions, S.precision].every((t) => dtxt.includes(t)), L + " sources : attributions, Q1–Q3, propositions, précision Fournier");
    ok(dtxt.includes("55") && dtxt.includes("38") && dtxt.includes("11") && C.documentation.repertoire.relations_ouvertes.every((r) => dtxt.includes(r)), L + " sources : décompte du répertoire");
    const hrefs = await page.$$eval(".drawer a", (a) => a.map((x) => x.getAttribute("href")));
    ok(hrefs.length === S.references.length && hrefs.every((h) => S.references.some((r) => r.url === h)), L + " sources : " + hrefs.length + " liens, tous vers les DOI vérifiés");
    await page.keyboard.press("Escape");
    ok(!(await page.$(".drawer")), L + " Échap ferme le volet");
    await accueilShows(page, "I", L + " après fermeture du volet");
    let hits = await raysOverText(page);
    ok(hits.length === 0, L + " accueil : aucun faisceau sur un texte" + (hits.length ? " (" + hits.join(" | ") + ")" : ""));
    let ov = await textOverlaps(page, ".chain-k, .c-btn, .c-reason, .c-src, .rub-t, .rub-term, .rub-f, .judge-out, .p-lab");
    ok(ov.length === 0, L + " accueil : aucun chevauchement de textes" + (ov.length ? " (" + ov.join(" | ") + ")" : ""));
    ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= vp.w, L + " accueil : pas de défilement horizontal");
    if (shots) { await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.screenshot({ path: path.join(shots, "accueil-" + vp.f + ".png"), fullPage: true }); }

    /* ---------- illustrations ---------- */
    await page.click('a[href="#/illustrations"].tab'); await page.waitForTimeout(400);
    ok(norm(await page.textContent("#page-title")) === C.illustrations.titre, L + " illustrations : titre (navigation)");
    ok(norm(await page.textContent(".i-head .tag-built")) === C.illustrations.mention, L + " mention « Illustration construite »");
    const order = await page.$$eval(".r-card", (e) => e.map((x) => x.dataset.c));
    ok(JSON.stringify(order) === JSON.stringify(C.illustrations.couple_initial), L + " ouverture sur Parties prenantes ciblées et Individualiste");
    ok(norm(await page.textContent(".dos-facts")) === ver("A").faits_communs && !(await page.$(".dos-band")), L + " ouverture sur le dossier A");
    await cardsShow(page, "A", L);
    ok(norm(await page.textContent(".i-expl")) === ver("A").explication, L + " phrase d'explication (A)");
    if (vp.n === "ordinateur") {
      const ob = await page.$$eval(".out-main", (e) => Math.max(...e.map((x) => x.getBoundingClientRect().bottom)));
      ok(ob <= vp.h, L + " les deux conclusions sont dans le premier écran (" + Math.round(ob) + " px)");
    }
    hits = await raysOverText(page);
    ok(hits.length === 0, L + " illustrations : aucun trait sur un texte" + (hits.length ? " (" + hits.join(" | ") + ")" : ""));
    if (shots) { await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.screenshot({ path: path.join(shots, "illustrations-A-" + vp.f + ".png"), fullPage: true }); }

    /* raisonnement déplié, puis ajout de l'information */
    await page.click('.r-card[data-c="I"] .reasoning summary');
    const rr = await page.$$eval('.r-card[data-c="I"] .rr-t', (e) => e.map((x) => x.textContent));
    ok(JSON.stringify(rr) === JSON.stringify(FIDS.map((f) => lect("A", "I").rubriques[f])), L + " « Voir le raisonnement » : quatre rubriques de la lecture I");
    await page.click("#add-info"); await page.waitForTimeout(300);
    ok(norm(await page.textContent(".dos-band")) === ver("B").bandeau, L + " B : bandeau de nouvelle version");
    const facts = norm(await page.textContent(".dos-facts")).replace("Information ajoutée : ", "");
    ok(facts === ver("B").faits_communs, L + " B : faits du dossier enrichi, sans la lacune de A");
    ok(norm(await page.textContent("mark.added")).includes("auprès des mêmes personnes"), L + " B : complément mis en évidence");
    await cardsShow(page, "B", L);
    ok(norm(await page.textContent(".i-expl")) === ver("B").explication, L + " phrase d'explication (B)");
    ok(norm(await page.textContent(".i-note")) === X.note_complement, L + " note sur la confirmation du transfert");
    ok(await page.$eval('.r-card[data-c="I"] .reasoning', (d) => d.open), L + " le raisonnement déplié reste ouvert après l'ajout");
    ok(await page.evaluate(() => document.activeElement && document.activeElement.id === "dossier"), L + " le focus passe au dossier modifié");
    /* détails de l'exemple : l'état B est conservé */
    await page.click("#example-sources");
    const et = norm(await page.textContent(".drawer"));
    ok([X.details.premisses, X.details.limite, X.details.deduction, X.origine].every((t) => et.includes(t)), L + " « Sources et prémisses de cet exemple »");
    ok((await page.$$eval(".drawer a", (a) => a.map((x) => x.href))).every((h) => /^https:\/\/doi\.org\/10\./.test(h)), L + " liens DOI de l'exemple");
    await page.click(".drawer-close");
    await page.click("#nav-sources"); await page.keyboard.press("Escape");
    ok(norm(await page.textContent(".dos-band")) === ver("B").bandeau, L + " après les volets, le dossier B est conservé");
    hits = await raysOverText(page);
    ok(hits.length === 0, L + " illustrations B : aucun trait sur un texte" + (hits.length ? " (" + hits.join(" | ") + ")" : ""));
    if (shots) { await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.screenshot({ path: path.join(shots, "illustrations-B-" + vp.f + ".png"), fullPage: true }); }
    await page.click("#back-info"); await page.waitForTimeout(300);
    ok(norm(await page.textContent(".dos-facts")) === ver("A").faits_communs && !(await page.$(".dos-band")), L + " retour : dossier A rétabli");
    await cardsShow(page, "A", L + " retour");

    /* deux autres exemples, fermés par défaut */
    const others = await page.$$eval("details.other", (d) => d.map((x) => [x.id, x.open]));
    ok(JSON.stringify(others) === JSON.stringify(C.illustrations.complementaires.map((e) => ["ex-" + e.id, false])), L + " deux autres exemples, fermés par défaut");
    await page.click("#ex-acces-et-besoin summary");
    ok(norm(await page.textContent("#ex-acces-et-besoin")).includes(C.illustrations.complementaires[0].enseignement), L + " exemple complémentaire déplié");
    ok((await page.evaluate(() => document.documentElement.scrollWidth)) <= vp.w, L + " illustrations : pas de défilement horizontal");

    /* retour à l'accueil : le choix de conception est conservé ; retour aux illustrations : entrée sur A */
    await page.click('#add-info');
    await page.click('a[href="#/"].tab'); await page.waitForTimeout(400);
    ok(JSON.stringify(await pressed(page)) === JSON.stringify(["I"]), L + " l'accueil conserve la conception choisie");
    await page.goto(url + "#/illustrations"); await page.waitForTimeout(300);
    ok(!(await page.$(".dos-band")), L + " les illustrations s'ouvrent à nouveau sur A");

    /* anciens liens */
    await page.goto(url + "#/illustrations/C05"); await page.waitForTimeout(300);
    ok(await page.isVisible(".notice") && (await page.evaluate(() => location.hash)) === "#/illustrations" && !(await page.$(".dos-band")), L + " ancien lien de cas : entrée des illustrations, avec indication de mise à jour");
    await page.goto(url + "#/catalogue/cmp-3"); await page.waitForTimeout(300);
    ok(await page.isVisible(".notice") && (await page.evaluate(() => location.hash)) === "#/" && !!(await page.$("#model")), L + " ancienne rubrique : entrée de l'accueil, avec indication de mise à jour");
    await page.click("#foot-sources");
    ok(await page.isVisible(".drawer"), L + " lien des sources dans le pied de page");

    ok(errs.length === 0, L + " aucune erreur JavaScript" + (errs.length ? " (" + errs.join(" | ") + ")" : ""));
    await page.close();
  }

  /* animations réduites : le choix s'applique sans attente */
  const rp = await browser.newPage({ viewport: { width: 1320, height: 900 }, reducedMotion: "reduce" });
  await rp.goto(url + "#/"); await rp.waitForTimeout(300);
  await rp.click('.c-btn[data-c="N"]');
  ok((await valuetext(rp)) === conc("N").nom, "[animations réduites] le prisme suit le bouton immédiatement");
  await rp.focus("#model .dial"); await rp.keyboard.press("ArrowLeft");
  ok((await valuetext(rp)) === conc("V").nom && JSON.stringify(await pressed(rp)) === '["V"]', "[animations réduites] le clavier tourne le prisme et sélectionne le bouton");
  await rp.close();
  await browser.close();
  console.log(fails ? fails + " échec(s)" : "Tous les contrôles passent.");
  process.exit(fails ? 1 : 0);
})();
