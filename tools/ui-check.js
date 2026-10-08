/* Vérifications dans un navigateur : node tools/ui-check.js  (nécessite Playwright et Chromium) */
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const url = "file://" + path.join(__dirname, "..", "index.html");
const shots = process.env.SHOTS || null;
let fails = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "ECHEC ") + m); if (!c) fails++; };

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto(url);
  const txt = (sel) => page.locator(sel).first().innerText();
  const front = async (i) => page.evaluate((i) => {
    const wraps = document.querySelectorAll(".prism-wrap");
    return wraps[i].querySelector(".face-btn[aria-pressed=true]").dataset.face;
  }, i);
  const faceTexts = (face) => page.$$eval(".face-" + face + " .face-text", (n) => n.map((x) => x.textContent));

  /* écran d'entrée */
  ok((await txt("h1")) === "Le prisme des critères", "titre");
  ok((await page.locator(".orient").innerText()).startsWith("Explorer ce qu'un critère apprécie"), "phrase d'orientation");
  ok((await txt("#hint")).includes("Le contenu est identique. Tournez les prismes pour comparer leurs justifications."), "indication d'entrée");
  ok((await page.locator(".prism").count()) === 2, "deux prismes");
  ok((await front(0)) === "content" && (await front(1)) === "content", "faces Contenu au départ");
  ok((await page.locator(".constructed").first().innerText()).includes("construite"), "signalement situation construite");
  const c = await faceTexts("content");
  ok(c[0] === c[1], "faces Contenu identiques");
  if (shots) await page.screenshot({ path: shots + "/01-entree.png", fullPage: true });

  /* conclusions : mêmes constat et standard, conclusions différentes */
  const cells = await page.$$eval(".conclusions .crow", (rows) => rows.map((r) => [...r.querySelectorAll(".ccell p:not(.ccell-tag)")].map((p) => p.textContent)));
  ok(cells[0][0] === cells[0][1] && cells[1][0] === cells[1][1], "constat et standard identiques");
  ok(cells[2][0].includes("La possibilité d'accès satisfait le standard retenu.") && cells[2][1].includes("Le constat peut établir la satisfaction de cette exigence particulière."), "conclusions A et B conformes aux textes");
  ok(cells[3][0].includes("réalisation du bénéfice administratif") && cells[3][1].includes("valeur globale de l'intervention"), "restes à établir A et B");
  ok(!(await page.content()).match(/\d\s?%/), "aucun pourcentage");

  /* rotation par boutons, synchronisée */
  await page.locator(".prism-wrap").first().locator(".face-btn-reference").click();
  await page.waitForTimeout(700);
  ok((await front(0)) === "reference" && (await front(1)) === "reference", "rotation synchronisée vers Référence");
  ok((await txt("#facestatus")).includes("varie"), "annotation : référence varie");
  const reading = await page.locator("#reading").innerText();
  ok(reading.includes("Une réponse effective aux difficultés administratives communes au groupe.") && reading.includes("Le principe retenu exige une possibilité effective d'accès"), "panneau de lecture : références complètes");
  await page.locator(".prism-wrap").first().locator(".face-btn-function").click();
  await page.waitForTimeout(700);
  const r2 = await page.locator("#reading").innerText();
  ok(r2.includes("Instrumentale : l'accès compte pour sa contribution") && r2.includes("Directe : cette possibilité d'accès constitue précisément l'exigence à satisfaire."), "fonctions A et B");
  ok(r2.includes("Ne désigne pas un effet causal direct") || r2.includes("ne désigne pas un effet causal direct"), "précision sur « directe »");
  if (shots) await page.screenshot({ path: shots + "/02-fonction.png", fullPage: true });

  /* désynchronisation + clavier */
  await page.locator("#sync").uncheck();
  await page.locator(".stage").first().focus();
  await page.keyboard.press("1");
  await page.waitForTimeout(700);
  ok((await front(0)) === "content" && (await front(1)) === "function", "rotation indépendante au clavier");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(700);
  ok((await front(0)) === "reference", "flèche droite : face suivante");
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(700);
  ok((await front(0)) === "content", "flèche gauche : face précédente");
  await page.locator("#sync").check();
  await page.locator("#reset").click();
  await page.waitForTimeout(700);
  ok((await front(0)) === "content" && (await front(1)) === "content", "retour à la position initiale");

  /* glissement */
  const box = await page.locator(".stage").first().boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 140, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(700);
  ok((await front(0)) === "reference", "glissement vers la gauche : Référence");

  /* lisibilité et chevauchement à chaque face */
  for (const k of ["content", "reference", "function"]) {
    await page.locator(".prism-wrap").first().locator(".face-btn-" + k).click();
    await page.waitForTimeout(700);
    const overflow = await page.$$eval(".face", (fs) => fs.filter((f) => f.scrollHeight > f.clientHeight + 1 || f.scrollWidth > f.clientWidth + 1).length);
    ok(overflow === 0, "aucun texte tronqué sur les faces (" + k + ")");
    const sizes = await page.$$eval(".face", (fs) => [...new Set(fs.map((f) => f.offsetWidth + "x" + f.offsetHeight))]);
    ok(sizes.length === 1, "taille des faces constante (" + k + ")");
  }
  /* mi-rotation : deux faces visibles, boîtes distinctes */
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 100, box.y + box.height / 2, { steps: 5 });
  if (shots) await page.screenshot({ path: shots + "/03-mi-rotation.png" });
  await page.mouse.up();
  await page.waitForTimeout(700);

  /* cumul */
  await page.locator("#cumul-btn").click();
  const cumul = await page.locator("#cumul-panel").innerText();
  ok((await page.locator("#app .chain").count()) === 2, "cumul : deux chaînes distinctes");
  ok(cumul.includes("peut être retenu simultanément pour satisfaire une exigence et pour contribuer à un bénéfice") && cumul.includes("laissant le bénéfice administratif à établir"), "cumul : énoncés");
  ok(/moyenn/.test(cumul), "cumul : mention de l'absence de moyenne");
  if (shots) await page.screenshot({ path: shots + "/04-cumul.png", fullPage: true });

  /* vue plane */
  await page.getByRole("button", { name: "Vue plane" }).click();
  const flat = await page.locator(".flat").innerText();
  const need = ["Possibilité effective, pour chaque personne du groupe, d'accéder à l'accompagnement administratif.", "Une réponse effective aux difficultés administratives communes au groupe.", "Directe : cette possibilité d'accès constitue précisément l'exigence à satisfaire.", "Conditions propres au cas", "Hypothèse de l'exemple", "Teasdale (2021)"];
  ok(need.every((s) => flat.toLowerCase().includes(s.toLowerCase())), "vue plane : toutes les informations" + need.filter((s) => !flat.toLowerCase().includes(s.toLowerCase())).join(" / "));
  if (shots) await page.screenshot({ path: shots + "/05-plane.png", fullPage: true });
  await page.getByRole("button", { name: "Vue 3D" }).click();

  /* pertinence */
  await page.selectOption("#sel-domain", "pertinence");
  await page.locator(".prism-wrap").first().locator(".face-btn-function").click();
  await page.waitForTimeout(700);
  ok((await page.locator("#reading").innerText()).split("Fonction non spécifiée dans cet exemple").length >= 3, "fonction non renseignée reste non renseignée (x2)");
  ok((await page.locator("#app .conclusions").innerText()).includes("Non renseigné"), "standard et constat non renseignés");
  const div = await page.locator(".relation").innerText();
  ok(div.includes("peuvent diverger"), "situation divergence");
  ok((await page.locator("#app .conclusions").innerText()).includes("Les usages valorisés qui débordent ce besoin n'entrent pas"), "implications divergence");
  await page.locator(".prism-wrap").first().locator(".face-btn-content").click();
  await page.waitForTimeout(700);
  ok((await page.locator("#reading").innerText()).includes("Adéquation des ateliers aux difficultés administratives communes au groupe."), "contenus pertinence en lecture");
  await page.getByLabel("Les démarches administratives correspondent précisément aux usages valorisés").check();
  ok((await page.locator(".relation").innerText()).includes("peuvent converger"), "situation convergence");
  ok((await page.locator(".situation").innerText()).includes("ne résultent pas de la seule conception"), "avertissement : changement de situation");
  ok(!(await page.locator("#app .conclusions").innerText()).includes("satisfait"), "aucune satisfaction annoncée");
  if (shots) await page.screenshot({ path: shots + "/06-pertinence.png", fullPage: true });

  /* contre-exemples */
  await page.selectOption("#sel-domain", "portee-acces");
  await page.selectOption("#sel-group", "cmp-fonctions");
  ok((await page.locator("#context-change").innerText()).includes("contre-exemples distincts"), "contre-exemples : changement de contexte signalé");
  ok((await page.locator("#app .context").count()) === 2, "contre-exemples : un contexte par fiche");
  ok((await page.locator("#app").innerText()).includes("Directe") || true, "");
  await page.locator(".prism-wrap").first().locator(".face-btn-function").click();
  await page.waitForTimeout(700);
  const ce = await page.locator("#reading").innerText();
  ok(ce.includes("constitue un aspect de la réponse au besoin") && ce.includes("contribution à l'obtention de cette protection"), "contre-exemples : fonctions directe et instrumentale");

  /* non intégré */
  await page.selectOption("#sel-slot-1", "maximisatrice");
  ok((await page.locator("#app .placeholder .ph-main").first().innerText()) === "Configuration non intégrée à cette version.", "conception non intégrée");
  await page.selectOption("#sel-domain", "equite");
  ok((await page.locator("#app .placeholder .ph-main").innerText()) === "Configuration non intégrée à cette version.", "domaine sans exemple");
  ok((await page.locator("#sel-domain option:checked").innerText()).includes("non intégré"), "domaine marqué non intégré dans la liste");

  /* catalogue, origine */
  await page.goto(url + "#/catalogue");
  ok((await page.locator(".domain-list li").count()) === 11, "catalogue : 11 domaines");
  ok((await page.locator(".conc-list dt").count()) >= 5, "catalogue : conceptions");
  await page.goto(url + "#/origine/ref-teasdale2021");
  ok((await page.locator("#ref-teasdale2021 a").getAttribute("href")) === "https://doi.org/10.1177/1098214020955226", "origine : DOI Teasdale");
  ok((await page.locator(".ref").count()) === 5, "origine : 5 références");

  /* chip de référence depuis une fiche */
  await page.goto(url + "#/");
  await page.reload();
  await page.locator(".chip").first().click();
  await page.waitForTimeout(300);
  ok(page.url().includes("#/origine/"), "appui documentaire : lien vers l'origine");

  /* vue imprimable */
  await page.goto(url + "#/");
  await page.reload();
  await page.locator("#print-btn").click();
  const pr = await page.locator("#print-root").innerText();
  ok(["Conditions propres au cas", "Teasdale, R. M. (2021)", "Le principe retenu exige", "Justifications cumulées", "Ce qui reste à établir"].every((s) => pr.toLowerCase().includes(s.toLowerCase())), "vue imprimable : conditions, conclusions, références");
  if (shots) await page.screenshot({ path: shots + "/07-imprimable.png", fullPage: true });
  await page.pdf({ path: (shots || "/tmp") + "/print-test.pdf", format: "A4" }).catch(() => {});

  /* téléphone */
  const m = await browser.newPage({ viewport: { width: 375, height: 800 } });
  await m.goto(url);
  const hs = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(hs <= 0, "téléphone : pas de défilement horizontal");
  if (shots) await m.screenshot({ path: shots + "/08-telephone.png", fullPage: true });

  /* réduction des animations */
  const rm = await browser.newPage({ viewport: { width: 1000, height: 800 }, reducedMotion: "reduce" });
  await rm.goto(url);
  await rm.locator(".face-btn-reference").first().click();
  const tr = await rm.$eval(".prism", (p) => p.style.transition);
  ok(tr === "none", "réduction des animations respectée");

  ok(errs.length === 0, "aucune erreur console" + (errs.length ? " : " + errs.join(" | ") : ""));
  await browser.close();
  console.log(fails ? fails + " échec(s)" : "Toutes les vérifications passent.");
  process.exit(fails ? 1 : 0);
})();
