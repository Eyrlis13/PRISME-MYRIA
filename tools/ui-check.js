/* Vérifications dans un navigateur : node tools/ui-check.js  (nécessite Playwright et Chromium) */
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const url = "file://" + path.join(__dirname, "..", "index.html");
const shots = process.env.SHOTS || null;
let fails = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "ECHEC ") + m); if (!c) fails++; };
const missing = (txt, arr) => arr.filter((s) => !txt.toLowerCase().includes(s.toLowerCase()));

/* Rectangles de texte qui se chevauchent dans un conteneur (libellés visibles uniquement). */
async function textOverlaps(page, sel) {
  return page.$$eval(sel, (els) => {
    const r = els.filter((e) => e.getBoundingClientRect().width > 0).map((e) => ({ t: e.textContent.trim().slice(0, 30), b: e.getBoundingClientRect() }));
    const out = [];
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
      const a = r[i].b, c = r[j].b;
      if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) out.push(r[i].t + " / " + r[j].t);
    }
    return out;
  });
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1320, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto(url);
  await page.waitForTimeout(500);
  const txt = (sel) => page.locator(sel).first().innerText();
  const drawer = () => page.locator(".drawer").innerText();
  const closeDrawer = async () => { await page.keyboard.press("Escape"); await page.waitForTimeout(100); };

  /* ---------- navigation ---------- */
  const tabs = await page.$$eval("#nav .tab", (t) => t.map((x) => x.textContent));
  ok(JSON.stringify(tabs) === JSON.stringify(["Modèle conceptuel", "Illustrations"]), "navigation : deux onglets");
  ok((await page.locator("#nav .tab.on").textContent()) === "Modèle conceptuel", "modèle conceptuel affiché par défaut");

  /* ---------- modèle : trajet lisible sans interaction ---------- */
  const model = await txt("#model");
  ok(missing(model, ["Domaine de critères", "Situation", "Propriété à apprécier", "Conception de la valeur", "Références compatibles", "Précision dans la situation", "Référence de valeur retenue", "précisée en amont", "Contenu", "Fonction"]).length === 0, "stations du trajet visibles");
  ok(missing(model, ["Quelle propriété est formulée comme désirable ?", "Au regard de quel bénéfice ou de quel principe cette propriété compte-t-elle ?", "Quelle relation justifie cette propriété au regard de cette référence ?"]).length === 0, "trois questions du critère");
  ok(model.includes("Une conception de la valeur oriente le contenu du critère par une référence précisée dans la situation. Des conceptions différentes peuvent justifier un même contenu."), "P1 visible");
  ok(model.includes("À contenu, standard et observations identiques, des justifications différentes peuvent autoriser des conclusions de portée différente."), "P2 visible");
  ok(missing(model, ["La propriété constitue un aspect du bénéfice ou une exigence du principe retenu.", "fonction directe", "La propriété contribue à réaliser ce bénéfice ou cette exigence.", "fonction instrumentale"]).length === 0, "deux justifications et leurs noms");
  ok((await page.locator(".mf-concl").count()) === 2 && (await page.locator(".mf-remain").count()) === 2, "conclusion autorisée et éléments restant à établir distincts");
  ok(missing(model, ["Si le standard et les observations les couvrent effectivement.", "qui étayent la contribution de la propriété à sa réalisation", "se cumuler", "étendre ou réviser", "conserve son périmètre"]).length === 0, "conséquences et notes");
  const rays = await page.$$eval("#model .rays-overlay path", (p) => p.map((x) => x.getAttribute("class")));
  ok(rays.filter((c) => c === "beam-core" || c === "beam-core warm").length === 2 && rays.includes("ray-core") && rays.includes("orient-arc") && rays.filter((c) => c === "fn-line").length === 2, "faisceaux : entrant, orienté, référence retenue, orientation du contenu, liens vers les justifications");
  ok((await page.$$eval(".m-fan.is-h line.cand", (l) => l.length)) === 4 && (await page.$$eval(".m-fan.is-h line.kept", (l) => l.length)) === 1, "plusieurs références compatibles, une retenue");
  ok((await textOverlaps(page, "#model .st-label, #model .st-cap, #model .frame-tab, #model .dk, #model .dq, #model .ptxt, #model .mf-title")).length === 0, "modèle : aucun texte superposé (ordinateur)");
  const refBand = await page.locator('[data-anchor="reference"]').boundingBox();
  const rayEnd = await page.$eval("#model .ray-core", (p) => { const l = p.getTotalLength(); const q = p.getPointAtLength(l); const s = p.ownerSVGElement.getBoundingClientRect(); return { x: q.x + s.left, y: q.y + s.top }; });
  ok(Math.abs(rayEnd.x - refBand.x) < 6 && rayEnd.y > refBand.y && rayEnd.y < refBand.y + refBand.height, "continuité : le rayon de la référence retenue aboutit à la bande Référence");
  if (shots) await page.screenshot({ path: shots + "/01-modele.png", fullPage: true });

  /* ---------- relations : explication au clic ---------- */
  for (const [sel, title] of [[".prism-btn", "La conception oriente"], [".fan-r", "Précision dans la situation"], [".c-p1", "P1"], [".dim-function", "Fonction"], [".c-p2", "P2"]]) {
    await page.locator(sel).first().click();
    const d = await drawer();
    ok(d.includes(title) && missing(d, ["Ce qui est mobilisé", "Ce qui doit être justifié", "Ce qu'on peut en déduire", "Voir cette relation dans un exemple"]).length === 0, "relation « " + title + " » : mobilisé, à justifier, déduit, exemple");
    await closeDrawer();
  }
  await page.locator(".prism-btn").click();
  await page.locator(".drawer details summary").click();
  ok((await drawer()).includes("Parties prenantes ciblées") && (await page.locator(".drawer .ref-chip").count()) >= 1, "détail dépliable : conceptions et appuis");
  await page.locator(".drawer .ref-chip").first().click();
  ok((await drawer()).includes("doi.org"), "note de référence");
  await closeDrawer();
  await page.locator("#notes-btn").click();
  ok((await page.locator(".drawer .ref").count()) === 5, "notes et références : 5 références");
  await closeDrawer();

  /* ---------- du modèle à l'exemple ---------- */
  await page.locator(".c-p2").click();
  await page.locator(".drawer .ex-btn").first().click();
  await page.waitForTimeout(500);
  ok(page.url().endsWith("#/illustrations") && (await page.locator("#nav .tab.on").textContent()) === "Illustrations", "accès à l'exemple depuis P2");
  ok((await txt(".rel-banner")).includes("P2") && (await txt(".rel-banner")).includes("Modèle conceptuel"), "bandeau de la relation illustrée, retour au modèle");
  ok((await page.locator(".stage2").count()) === 1, "étape 2 ouverte");

  /* ---------- illustration : distinctions explicites ---------- */
  const ill = await txt(".compare");
  ok(missing(ill, ["Conception générale mobilisée", "Référence choisie pour ce cas", "Fonction justifiée dans ce cas", "Conclusion autorisée", "Éléments restant à établir", "justification construite pour ce cas", "autre justification construite"]).length <= 1, "illustration : conception, référence, fonction, conclusion, restes");
  ok(missing(ill, ["La possibilité d'accès satisfait le standard retenu.", "Le constat peut établir la satisfaction de cette exigence particulière.", "réalisation du bénéfice administratif", "valeur globale de l'intervention"]).length === 0, "conclusions et restes de l'exemple");
  const marks = () => page.$$eval(".mark-cell", (c) => c.map((x) => (x.querySelector(".mark") || {}).textContent || ""));
  ok(JSON.stringify(await marks()) === JSON.stringify(["=", "≠", "≠"]), "marques = ≠ ≠");
  await page.locator(".dial").nth(1).locator(".p-lab", { hasText: "Vertueuse" }).click();
  await page.waitForTimeout(800);
  ok((await page.locator(".dial").nth(1).getAttribute("aria-valuetext")).includes("Vertueuse"), "rotation d'un prisme");
  await page.locator(".dial").nth(1).focus();
  await page.keyboard.press("Home");
  await page.waitForTimeout(800);
  ok((await page.locator(".dial").nth(1).getAttribute("aria-valuetext")) === "Normative", "retour au clavier");
  await page.locator(".dial").nth(1).focus();
  await page.keyboard.press("3");
  await page.waitForTimeout(800);
  ok((await txt(".compare")).includes("autre justification construite pour ce cas"), "le changement de conception est présenté comme une autre justification construite");
  await page.keyboard.press("Home");
  await page.waitForTimeout(800);
  await page.locator('.band[data-slot="1"][data-face="reference"]').click();
  ok((await drawer()).includes("Le principe retenu exige une possibilité effective"), "détail d'une bande");
  await page.locator(".drawer .ref-chip").first().click();
  ok((await drawer()).includes("doi.org"), "appui d'une bande : note de référence");
  await closeDrawer();
  await page.locator("#cumul-btn").click();
  ok((await page.locator("#cumul-panel .chain").count()) === 2, "justifications cumulées : deux chaînes");

  /* pertinence et fonctions inversées */
  await page.locator(".domain-picker summary").click();
  await page.locator('.lamp[data-domain="pertinence"]').click();
  ok(JSON.stringify(await marks()) === JSON.stringify(["≠", "≠", "–"]), "pertinence : ≠ ≠ –");
  await page.locator('[data-situation="sit-convergence"]').click();
  ok(JSON.stringify(await marks()) === JSON.stringify(["≈", "≠", "–"]), "pertinence, convergence : ≈ ≠ –");
  await page.locator(".domain-picker summary").click();
  await page.locator('.lamp[data-domain="portee-acces"]').click();
  await page.locator(".examples .chip", { hasText: "Fonctions inversées" }).click();
  ok((await txt("#context-change")).includes("Autres situations"), "fonctions inversées : changement de situation signalé");
  await page.locator(".domain-picker summary").click();
  await page.locator('.lamp[data-domain="equite"]').click();
  ok((await txt(".empty")).includes("Configuration non intégrée à cette version."), "domaine sans exemple");
  await page.locator("#nav .tab", { hasText: "Modèle conceptuel" }).click();
  await page.waitForTimeout(300);
  ok((await page.locator("#model").count()) === 1, "retour au modèle par la navigation");
  ok(!(await txt("#app")).match(/\d\s?%/), "aucun pourcentage");

  /* ---------- téléphone ---------- */
  for (const w of [375, 768]) {
    const m = await browser.newPage({ viewport: { width: w, height: 800 } });
    await m.goto(url); await m.waitForTimeout(500);
    ok((await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0, w + " px : pas de défilement horizontal");
    ok((await textOverlaps(m, "#model .st-label, #model .st-cap, #model .frame-tab, #model .dk, #model .dq, #model .ptxt, #model .mf-title")).length === 0, w + " px : aucun texte superposé");
    const lab = await m.locator(".st-prism .st-label").boundingBox(), pr = await m.locator(".m-prism.is-v").boundingBox();
    ok(lab.x >= pr.x + pr.width - 1, w + " px : libellés à côté du faisceau");
    const hit = await m.evaluate(() => {
      const t = document.querySelector(".crit-title").getBoundingClientRect(), p = document.querySelector("#model .ray-core");
      const s = p.ownerSVGElement.getBoundingClientRect(), L = p.getTotalLength();
      for (let i = 0; i <= L; i += 2) { const q = p.getPointAtLength(i); const x = q.x + s.left, y = q.y + s.top; if (x > t.left && x < t.left + 120 && y > t.top && y < t.bottom) return true; }
      return false;
    });
    ok(!hit, w + " px : le rayon de la référence ne traverse pas l'intitulé du critère");
    if (shots) await m.screenshot({ path: shots + "/02-modele-" + w + ".png", fullPage: true });
    await m.close();
  }

  /* animations réduites */
  const rm = await browser.newPage({ viewport: { width: 1100, height: 800 }, reducedMotion: "reduce" });
  await rm.goto(url + "#/illustrations");
  await rm.locator(".dial").nth(0).focus();
  await rm.keyboard.press("ArrowRight");
  ok((await rm.locator(".dial").nth(0).getAttribute("aria-valuetext")).startsWith("Vertueuse"), "animations réduites : rotation immédiate");

  ok(errs.length === 0, "aucune erreur console" + (errs.length ? " : " + errs.join(" | ") : ""));
  await browser.close();
  console.log(fails ? fails + " échec(s)" : "Toutes les vérifications passent.");
  process.exit(fails ? 1 : 0);
})();
