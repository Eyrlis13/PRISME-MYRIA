/* Vérifications dans un navigateur : node tools/ui-check.js  (nécessite Playwright et Chromium) */
const path = require("path");
const fs = require("fs");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const url = "file://" + path.join(__dirname, "..", "index.html");
const D = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "PRISME_MAJ_2026-10-16.json"), "utf8"));
const shots = process.env.SHOTS || null;
let fails = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "ECHEC ") + m); if (!c) fails++; };
const PIDS = ["M", "I", "G", "V", "N"];
const DIMS = D.interface.dimension_order;
const norm = (s) => s.replace(/\s+/g, " ").trim();

/* Un faisceau traverse-t-il un texte ? On échantillonne chaque trajet et on teste les rectangles de texte. */
async function raysOverText(page, textSel) {
  return page.evaluate((sel) => {
    const texts = [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().width > 0)
      .map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 28), l: r.left + 3, r: r.right - 3, tp: r.top + 3, b: r.bottom - 3 }; });
    const hits = new Set();
    document.querySelectorAll(".rays-overlay path").forEach((p) => {
      const s = p.ownerSVGElement.getBoundingClientRect(); const L = p.getTotalLength();
      for (let i = 0; i <= L; i += 3) {
        const q = p.getPointAtLength(i), x = q.x + s.left, y = q.y + s.top;
        texts.forEach((t) => { if (x > t.l && x < t.r && y > t.tp && y < t.b) hits.add(t.t); });
      }
    });
    return [...hits];
  }, textSel);
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
const MODEL_TEXT = "#model .st-label, #model .st-cap, #model .kick-btn, #model .generic-hint, #model .cn, #model .cn-q, #model .req-k, #model .req-link, #model .mc-links, #model .mc-k, #model .mc-d, #model .dos-k, #model .judge-claim, #model .p-lab";
const ILLUS_TEXT = ".rl-txt, .conc-kick, .cn, .spec-chip, .dos-title, .dossier li, .hint-turn, .ab-switch, .p-lab, .status, .out-main";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1320, height: 900 }, reducedMotion: "reduce" });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto(url);
  await page.waitForTimeout(400);
  const txt = async (sel) => norm(await page.locator(sel).first().textContent());
  const drawer = async () => norm(await page.locator(".drawer").textContent());
  const closeDrawer = async () => { await page.keyboard.press("Escape"); await page.waitForTimeout(60); };

  /* ---------- en-tête et navigation ---------- */
  ok((await txt("h1")) === "Le prisme du jugement" && (await page.locator(".brand").textContent()) === "PRISME MYRIA", "nom et sous-titre");
  const tabs = await page.$$eval("#nav .tab", (t) => t.map((x) => x.textContent));
  ok(JSON.stringify(tabs) === JSON.stringify(["Modèle conceptuel", "Illustrations"]), "navigation : deux entrées");
  ok((await page.locator("#nav .tab.on").textContent()) === "Modèle conceptuel", "modèle conceptuel par défaut");

  /* ---------- modèle conceptuel : vue générique ---------- */
  const m = await txt("#model");
  ok(m.includes("Une conception de la valeur sociale oriente les exigences auxquelles un dossier doit répondre pour soutenir un jugement."), "texte d'introduction");
  ok((await page.locator("#model .dial").count()) === 1, "un seul grand prisme");
  ok((await page.locator("#model .dial").getAttribute("aria-valuetext")).startsWith("Vue générique"), "ouverture en vue générique, sans conception choisie");
  ok(["Conception de la valeur sociale", "Exigences de justification", "Dossier évaluatif commun", "Confrontation du dossier aux exigences", "Jugement justifié sur l’action"].every((s) => m.includes(s)), "les cinq blocs du modèle");
  ok(m.includes("Conditions établies, contredites ou indéterminées.") && m.includes("Appréciation · portée autorisée · réserves"), "confrontation et sortie");
  const cards = await page.$$eval("#model .dim-card", (c) => c.map((x) => x.getAttribute("data-dim")));
  ok(JSON.stringify(cards) === JSON.stringify(DIMS), "quatre dimensions dans l'ordre");
  ok(D.model.dimensions.every((d) => m.includes(d.label) && m.includes(d.short)), "libellés et formulations courtes des dimensions");
  ok((await page.$$eval("#model .rays-overlay path.ray-core", (p) => [...new Set(p.map((x) => x.getAttribute("stroke")))])).length === 4, "quatre faisceaux colorés, un par dimension");
  ok((await page.locator("#model .dossier-line").count()) === 1 && (await page.locator("#model .judge-line").count()) === 1, "le dossier rejoint la confrontation ; la confrontation mène au jugement");
  ok(!/\b(P1|P2)\b|fonction directe|fonction instrumentale/i.test(m), "ni P1/P2 ni bifurcation directe/instrumentale au centre du modèle");
  ok((await page.locator("#model .status").count()) === 0, "aucun verdict fictif sur le modèle");
  ok((await raysOverText(page, MODEL_TEXT)).length === 0, "modèle : aucun faisceau ne traverse un texte (ordinateur)" + JSON.stringify(await raysOverText(page, MODEL_TEXT)));
  if (shots) await page.screenshot({ path: shots + "/01-modele.png", fullPage: true });

  /* dimension cliquable : définition, rôle, articulation */
  for (const d of D.model.dimensions) {
    await page.locator(`#model .dim-card[data-dim="${d.id}"]`).click();
    const t = await drawer();
    ok(t.includes(d.definition) && t.includes("Rôle dans le raisonnement") && t.includes("Articulation avec les autres dimensions"), "explication de « " + d.label + " »");
    await closeDrawer();
  }
  await page.locator("#relations-btn").click();
  ok((await drawer()).includes(D.model.relations), "relations entre dimensions");
  await closeDrawer();

  /* rotation : cinq conceptions */
  for (let k = 0; k < 5; k++) {
    const pid = PIDS[k], prof = D.profiles[pid];
    await page.locator("#model .dial").focus();
    await page.keyboard.press(String(k + 1));
    await page.waitForTimeout(120);
    const texts = await page.$$eval("#model .dim-card .dt", (e) => e.map((x) => x.textContent));
    ok(JSON.stringify(texts) === JSON.stringify(DIMS.map((d) => prof.generic_dimensions[d])), "orientations génériques de « " + prof.name + " »");
    ok((await txt("#model .judge-claim")).includes(prof.claim) && (await page.locator("#model .status").count()) === 0, prof.name + " : proposition décrite, sans verdict");
    await page.locator("#conception-btn").click();
    const t = await drawer();
    ok(t.includes("Une même conception peut admettre plusieurs spécifications. Le principe, le périmètre ou la règle effectivement retenus doivent être explicités."), prof.name + " : précision sur les spécifications");
    if (pid === "N") ok(t.includes("le principe reste ouvert") && t.includes("consentement"), "normative : principe ouvert, consentement réservé aux illustrations");
    await closeDrawer();
  }
  ok(!(await txt("#model .dim-card[data-dim='qualification']")).includes("consentement"), "normative générique : aucune mention du consentement dans les cartes");
  await page.locator("#generic-btn").click();
  ok((await page.locator("#model .dial").getAttribute("aria-valuetext")).startsWith("Vue générique"), "retour à la vue générique");
  /* noms autour du prisme au clavier */
  await page.locator("#model .p-lab[data-face='V']").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(120);
  ok((await page.locator("#model .dial").getAttribute("aria-valuetext")) === "Vertueuse", "nom de conception activable au clavier");
  await page.locator("#to-illustrations").click();
  await page.waitForTimeout(200);
  ok(page.url().endsWith("#/illustrations") && (await page.locator(".r-col[data-slot='0'] .dial").getAttribute("aria-valuetext")) === "Vertueuse", "passage vers les illustrations avec la conception choisie");

  /* ---------- illustrations ---------- */
  await page.goto(url + "#/illustrations"); await page.reload(); await page.waitForTimeout(300);
  ok((await page.locator("#case-select").inputValue()) === "C04", "ouverture sur C04");
  const dial = (i) => page.locator(`.r-col[data-slot="${i}"] .dial`);
  ok((await dial(0).getAttribute("aria-valuetext")) === "Parties prenantes ciblées" && (await dial(1).getAttribute("aria-valuetext")) === "Maximisatrice", "A : parties prenantes ciblées ; B : maximisatrice");
  ok((await page.locator(".dossier").count()) === 1 && (await txt(".dossier")).includes("Situation construite"), "dossier commun affiché une seule fois, situation construite");
  ok((await page.locator(".mark, .mark-cell").count()) === 0, "aucun signe = ou ≠ déduit");
  ok((await page.locator(".examples").count()) === 0 && !(await txt("#app")).includes("Fonctions inversées"), "ancien contrôle « exemple principal / fonctions inversées » retiré");
  ok((await page.locator(".quick .chip").count()) === 5, "cinq cas démonstratifs en accès direct");
  ok((await page.locator("#case-select option").count()) === 15, "les quinze cas dans le sélecteur");
  ok((await raysOverText(page, ILLUS_TEXT)).length === 0, "illustrations : aucun faisceau ne traverse un texte (ordinateur)" + JSON.stringify(await raysOverText(page, ILLUS_TEXT)));
  if (shots) await page.screenshot({ path: shots + "/02-illustrations.png", fullPage: true });

  /* C04 */
  const col = (i) => `.r-col[data-slot="${i}"]`;
  ok((await txt(col(0) + " .out-main")) === D.cases[3].readings.G.conclusion && (await txt(col(1) + " .out-main")) === D.cases[3].readings.M.conclusion, "C04 : réponse au besoin ciblé établie ; meilleur choix collectif réfuté");
  ok((await txt(col(0) + " .status")) === "Proposition établie" && (await txt(col(1) + " .status")) === "Proposition réfutée", "C04 : statuts propres à chaque proposition");
  ok((await page.locator("#audit").count()) === 1, "analyse transversale documentée pour la paire G/M");

  /* 15 cas × 5 conceptions, côté A ; le côté B et le dossier ne bougent pas */
  let readingsOk = 0, dossierStable = true, bStable = true, refsOk = true;
  for (const c of D.cases) {
    await page.selectOption("#case-select", c.id);
    await page.waitForTimeout(40);
    const dos = await txt(".dossier");
    const facts = await page.$$eval(".dos-facts li", (l) => l.map((x) => x.textContent));
    if (JSON.stringify(facts) !== JSON.stringify(c.facts) || !dos.includes(c.objective)) dossierStable = false;
    const bBefore = await txt(col(1));
    for (let k = 0; k < 5; k++) {
      const pid = PIDS[k], r = c.readings[pid];
      await dial(0).focus();
      await page.keyboard.press(String(k + 1));
      await page.waitForTimeout(30);
      const dts = await page.$$eval(col(0) + " .dim-card .dt", (e) => e.map((x) => x.textContent));
      const good = JSON.stringify(dts) === JSON.stringify(DIMS.map((d) => r.dimensions[d].text)) &&
        (await txt(col(0) + " .out-main")) === r.conclusion && (await txt(col(0) + " .out-why")) === r.justification &&
        (await txt(col(0) + " .out-limit")) === r.reserve && (await txt(col(0) + " .out-scope")).includes(r.scope) &&
        (await txt(col(0) + " .cn")) === D.profiles[pid].name;
      if (good) readingsOk++; else console.log("   lecture incorrecte " + c.id + "/" + pid);
      if ((await txt(".dossier")) !== dos) dossierStable = false;
      if ((await txt(col(1))) !== bBefore) bStable = false;
      if (k === 4 || c.id === "C15") {
        await page.locator(col(0) + " .refs-btn").click();
        const t = await drawer();
        const expected = r.references.map((ref) => ref.split(":")[1]).filter(Boolean);
        if (!expected.every((p) => t.includes("p. " + p))) refsOk = false;
        await closeDrawer();
      }
    }
  }
  ok(readingsOk === 75, "75 lectures affichées conformément aux données (" + readingsOk + "/75)");
  ok(dossierStable, "le dossier reste strictement identique quand la conception change");
  ok(bStable, "une rotation du côté A ne modifie pas la lecture B");
  ok(refsOk, "les références affichées correspondent à la lecture sélectionnée");

  /* cas témoins */
  const show = async (cid, a, b) => {
    await page.selectOption("#case-select", cid);
    await dial(0).focus(); await page.keyboard.press(String(PIDS.indexOf(a) + 1)); await page.waitForTimeout(40);
    await dial(1).focus(); await page.keyboard.press(String(PIDS.indexOf(b) + 1)); await page.waitForTimeout(40);
  };
  await show("C06", "G", "V");
  ok((await txt(col(0) + " .status")) === "Proposition établie" && (await txt(col(1) + " .status")) === "Proposition indéterminée" && (await txt(col(1) + " .out-limit")).includes("Indéterminé ne signifie pas immoral"), "C06 : bénéfice établi, origine morale indéterminée");
  await show("C15", "M", "N");
  ok((await txt(".dos-limits")).includes("Cas délibérément fermé") && (await txt(".dossier")).includes("L’expérience de pensée stipule"), "C15 : hypothèses du dossier visibles");
  await page.locator(".dossier details summary").click();
  ok((await txt(".dossier")).includes("Cette opposition suppose les variantes explicites et les hypothèses fortes du dossier."), "C15 : note d'ensemble accessible");
  ok((await txt(col(1) + " .spec-chip")) === "Principe retenu : consentement", "C15 : principe retenu affiché pour la lecture normative");
  ok((await txt(col(0) + " .status")) === "Proposition établie" && (await txt(col(1) + " .status")) === "Proposition réfutée", "C15 : justification selon M1, contraire à N1");
  await page.selectOption("#case-select", "C01");
  const c01 = [];
  for (let k = 0; k < 5; k++) { await dial(0).focus(); await page.keyboard.press(String(k + 1)); await page.waitForTimeout(30); c01.push([await txt(col(0) + " .status"), await txt(col(0) + " .out-scope")]); }
  ok(c01.every((x) => x[0] === "Proposition établie") && new Set(c01.map((x) => x[1])).size === 5, "C01 : convergence des cinq lectures, portées distinctes");
  await page.selectOption("#case-select", "C10");
  const c10 = [];
  for (let k = 0; k < 5; k++) { await dial(0).focus(); await page.keyboard.press(String(k + 1)); await page.waitForTimeout(30); c10.push(await txt(col(0) + " .status")); }
  ok(c10.every((x) => x === "Proposition indéterminée"), "C10 : indétermination sous les cinq conceptions");
  await page.selectOption("#case-select", "C05");
  ok((await page.locator("#sensitivity").count()) === 1 && (await page.locator(".readings #sensitivity").count()) === 0, "contrôles de sensibilité séparés du parcours principal");

  /* dimension dans une lecture */
  await page.selectOption("#case-select", "C04");
  await page.locator(col(0) + " .dim-card[data-dim='preuve']").click();
  ok((await drawer()).includes("Ce que le dossier permet effectivement d'établir"), "carte Preuve : exigence distinguée de la preuve disponible");
  await closeDrawer();
  await page.locator(col(1) + " .conc-name").click();
  ok((await drawer()).includes("Spécification appliquée") && /Code : [MIGVN]1/.test(await drawer()), "spécification appliquée et code de variante dans le détail");
  await closeDrawer();
  await page.locator("#notes-btn").click();
  const notes = await drawer();
  ok(notes.includes("Acquis attribués aux auteurs") && notes.includes("Formalisation proposée par notre travail") && notes.includes("Hypothèses et déductions des situations construites"), "références : trois provenances distinguées");
  await closeDrawer();

  /* version texte */
  await page.locator("#view-text").click();
  ok((await page.locator(".illus .dial").count()) === 0 && (await page.locator("#sel-slot-0").count()) === 1, "version texte accessible");
  await page.selectOption("#sel-slot-1", "I");
  ok((await txt(col(1) + " .cn")) === "Individualiste", "version texte : changement de conception");
  await page.locator("#view-bench").click();

  /* ---------- tablette et téléphone ---------- */
  for (const w of [375, 768]) {
    const mp = await browser.newPage({ viewport: { width: w, height: 820 }, reducedMotion: "reduce" });
    await mp.goto(url); await mp.waitForTimeout(400);
    ok((await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0, w + " px, modèle : pas de défilement horizontal");
    ok((await raysOverText(mp, MODEL_TEXT)).length === 0, w + " px, modèle : aucun faisceau sur un texte" + JSON.stringify(await raysOverText(mp, MODEL_TEXT)));
    ok((await textOverlaps(mp, MODEL_TEXT)).length === 0, w + " px, modèle : aucun texte superposé");
    if (shots) await mp.screenshot({ path: shots + "/03-modele-" + w + ".png", fullPage: true });
    await mp.goto(url + "#/illustrations"); await mp.reload(); await mp.waitForTimeout(400);
    ok((await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0, w + " px, illustrations : pas de défilement horizontal");
    ok((await raysOverText(mp, ILLUS_TEXT)).length === 0, w + " px, illustrations : aucun faisceau sur un texte" + JSON.stringify(await raysOverText(mp, ILLUS_TEXT)));
    ok((await mp.locator(".r-col[data-slot='1']").isVisible()) === false && (await mp.locator(".ab-switch").isVisible()), w + " px : une lecture à la fois, sélecteur A/B");
    await mp.locator("#show-1").click();
    ok((await mp.locator(".r-col[data-slot='1']").isVisible()) && (await mp.locator(".dossier").count()) === 1, w + " px : passage à B, dossier commun conservé");
    if (shots) await mp.screenshot({ path: shots + "/04-illustrations-" + w + ".png", fullPage: true });
    await mp.close();
  }

  ok(errs.length === 0, "aucune erreur console" + (errs.length ? " : " + errs.join(" | ") : ""));
  await browser.close();
  console.log(fails ? fails + " échec(s)" : "Toutes les vérifications passent.");
  process.exit(fails ? 1 : 0);
})();
