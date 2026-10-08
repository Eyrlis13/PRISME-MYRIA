/* Vérifications dans un navigateur : node tools/ui-check.js  (nécessite Playwright et Chromium) */
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const url = "file://" + path.join(__dirname, "..", "index.html");
const shots = process.env.SHOTS || null;
let fails = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "ECHEC ") + m); if (!c) fails++; };
const missing = (txt, arr) => arr.filter((s) => !txt.toLowerCase().includes(s.toLowerCase()));

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1320, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto(url);
  await page.waitForTimeout(400);
  const txt = (sel) => page.locator(sel).first().innerText();
  const dialVal = (i) => page.locator(".dial").nth(i).getAttribute("aria-valuetext");
  const band = (i, f) => page.locator(`.band[data-slot="${i}"][data-face="${f}"] .t`).innerText();
  const marks = () => page.$$eval(".mark-cell", (c) => c.map((x) => (x.querySelector(".mark") || {}).textContent || ""));
  const drawer = () => page.locator(".drawer").innerText();
  const closeDrawer = async () => { await page.keyboard.press("Escape"); await page.waitForTimeout(100); };

  /* entrée */
  ok((await txt("h1")) === "Le prisme des critères", "titre");
  ok((await page.locator(".dial").count()) === 2, "deux prismes");
  ok((await dialVal(0)) === "Parties prenantes ciblées" && (await dialVal(1)) === "Normative", "faces initiales A et B");
  ok((await txt(".src-v")).includes("Portée et accès"), "source : Portée et accès");
  ok((await txt(".sit-line")).toLowerCase().includes("situation construite"), "situation construite signalée");
  ok((await band(0, "content")) === (await band(1, "content")), "bandes Contenu identiques");
  ok(JSON.stringify(await marks()) === JSON.stringify(["=", "≠", "≠"]), "marques = ≠ ≠");
  ok((await band(0, "function")).startsWith("Instrumentale") && (await band(1, "function")).startsWith("Directe"), "fonctions A et B");
  ok((await page.locator(".rays-overlay .ray-core").count()) === 6 && (await page.locator(".rays-overlay .beam-core").count()) === 2, "rayons : 2 faisceaux, 6 rayons colorés");
  if (shots) await page.screenshot({ path: shots + "/01-entree.png", fullPage: true });

  /* situation : panneau */
  await page.locator("#ctx-open").click();
  ok((await drawer()).includes("un principe retenu exige") && (await drawer()).includes("Non renseignée (exemple construit)"), "situation complète dans le panneau");
  await closeDrawer();

  /* étape 2 */
  const s2 = await txt(".stage2");
  ok(s2.toLowerCase().includes("identique pour a et b") && (await page.locator(".s2-obs").count()) === 1, "constat et standard communs");
  ok(missing(s2, ["La possibilité d'accès satisfait le standard retenu.", "Le constat peut établir la satisfaction de cette exigence particulière."]).length === 0, "conclusions A et B");
  await page.locator(".s2-card details summary").first().click();
  await page.locator(".s2-card details summary").nth(1).click();
  ok(missing(await txt(".stage2"), ["réalisation du bénéfice administratif", "valeur globale de l'intervention", "doit être étayée", "couvrir les termes de l'exigence"]).length === 0, "restes à établir et conditions");
  ok(!(await txt("#app")).match(/\d\s?%/), "aucun pourcentage");

  /* détail d'une bande */
  await page.locator('.band[data-slot="1"][data-face="reference"]').click();
  ok(missing(await drawer(), ["Le principe retenu exige une possibilité effective", "Le principe retenu et ses termes doivent être explicités", "Hypothèse de l'exemple", "De la Cruz Jara et Spanjol (2025)"]).length === 0, "détail : formulation complète, conditions, origine, appuis");
  await closeDrawer();
  await page.locator('.band[data-slot="1"][data-face="function"]').click();
  ok((await drawer()).includes("ne désigne pas un effet causal direct"), "précision sur « directe »");
  await closeDrawer();
  ok((await page.locator(".drawer").count()) === 0, "Échap ferme le panneau");

  /* rotation : clic sur un nom */
  await page.locator('.dial >> nth=1').locator('.p-lab', { hasText: "Maximisatrice" }).click();
  await page.waitForTimeout(800);
  ok((await dialVal(1)).includes("Maximisatrice") && (await dialVal(1)).includes("non intégrée"), "clic sur un nom : Maximisatrice, non intégrée");
  ok((await txt('.band-empty[data-slot="1"]')).includes("Configuration non intégrée à cette version."), "écran : non intégrée");
  ok((await page.locator(".rays-overlay .ray-core").count()) === 3 && (await page.locator(".rays-overlay .beam-core.faint").count()) === 1, "rayon non décomposé");
  ok(JSON.stringify(await marks()) === JSON.stringify(["", "", ""]), "pas de marque sans configuration");
  /* clavier */
  await page.locator(".dial").nth(1).focus();
  await page.keyboard.press("5");
  await page.waitForTimeout(800);
  ok((await dialVal(1)) === "Normative", "touche 5 : Normative");
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(800);
  ok((await dialVal(1)).startsWith("Vertueuse"), "flèche gauche : face précédente");
  await page.keyboard.press("Home");
  await page.waitForTimeout(800);
  ok((await dialVal(1)) === "Normative", "Début : position initiale");
  /* glissement */
  const box = await page.locator(".dial-svg").nth(0).boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height * 128 / 270;
  await page.mouse.move(cx + 70, cy);
  await page.mouse.down();
  await page.mouse.move(cx, cy + 70, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(900);
  ok((await dialVal(0)) !== "Parties prenantes ciblées", "glissement : la face change");
  await page.locator(".dial").nth(0).focus();
  await page.keyboard.press("Home");
  await page.waitForTimeout(800);
  ok((await dialVal(0)) === "Parties prenantes ciblées", "retour à A");
  /* même conception des deux côtés */
  await page.locator(".dial").nth(1).focus();
  await page.keyboard.press("3");
  await page.waitForTimeout(800);
  ok(JSON.stringify(await marks()) === JSON.stringify(["=", "=", "="]), "même configuration des deux côtés : = = =");
  await page.keyboard.press("Home");
  await page.waitForTimeout(800);

  /* lisibilité : pas de chevauchement d'étiquettes, pas de rayon sur le texte */
  const overlaps = await page.$$eval(".dial-svg", (svgs) => svgs.reduce((n, s) => {
    const r = [...s.querySelectorAll("text")].map((t) => t.getBoundingClientRect());
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++)
      if (r[i].left < r[j].right && r[j].left < r[i].right && r[i].top < r[j].bottom && r[j].top < r[i].bottom) n++;
    return n;
  }, 0));
  ok(overlaps === 0, "aucun chevauchement d'étiquettes sur les prismes");
  const clipped = await page.$$eval(".dial-svg", (svgs) => svgs.reduce((n, s) => { const b = s.getBoundingClientRect(); return n + [...s.querySelectorAll("text")].filter((t) => { const r = t.getBoundingClientRect(); return r.left < b.left - 1 || r.right > b.right + 1; }).length; }, 0));
  ok(clipped === 0, "aucune étiquette coupée");

  /* cumul */
  await page.locator("#cumul-btn").click();
  const cumul = await page.locator("#cumul-panel").innerText();
  ok((await page.locator("#cumul-panel .chain").count()) === 2 && /moyenn/.test(cumul) && cumul.includes("laissant le bénéfice administratif à établir"), "cumul : deux chaînes, pas de moyenne");

  /* texte seul */
  await page.locator("#view-text").click();
  ok((await page.locator(".dial").count()) === 0 && (await page.locator(".band").count()) === 6, "texte seul : sans prismes, bandes présentes");
  await page.selectOption("#sel-slot-1", "vertueuse");
  ok((await page.locator(".band-empty").count()) === 1, "texte seul : conception non intégrée");
  await page.locator("#view-bench").click();

  /* pertinence */
  await page.locator(".domain-picker summary").click();
  await page.locator('.lamp[data-domain="pertinence"]').click();
  await page.waitForTimeout(300);
  ok((await txt(".src-v")).includes("Pertinence"), "source : Pertinence");
  ok((await band(0, "content")) !== (await band(1, "content")), "pertinence : contenus différents");
  ok((await band(0, "function")) === "Fonction non spécifiée dans cet exemple" && (await band(1, "function")) === "Fonction non spécifiée dans cet exemple", "fonction non renseignée reste non renseignée");
  ok(JSON.stringify(await marks()) === JSON.stringify(["≠", "≠", "–"]), "divergence : ≠ ≠ –");
  ok((await txt(".stage2")).includes("n'entrent pas dans le champ"), "implications divergence");
  await page.locator('[data-situation="sit-convergence"]').click();
  ok(JSON.stringify(await marks()) === JSON.stringify(["≈", "≠", "–"]), "convergence : ≈ ≠ –");
  ok((await page.locator('[data-situation="sit-convergence"]').getAttribute("aria-checked")) === "true", "situation sélectionnée");
  ok(!(await txt(".stage2")).includes("satisfait"), "aucune satisfaction annoncée");
  if (shots) await page.screenshot({ path: shots + "/03-pertinence.png", fullPage: true });

  /* contre-exemples */
  await page.locator(".domain-picker summary").click();
  await page.locator('.lamp[data-domain="portee-acces"]').click();
  await page.locator(".examples .chip", { hasText: "Contre-exemples" }).click();
  ok((await txt("#context-change")).includes("contre-exemples distincts"), "contre-exemples : changement de contexte signalé");
  ok((await page.locator(".ctx-chip").count()) === 2, "contre-exemples : un contexte par prisme");
  ok((await band(0, "function")).startsWith("Directe") && (await band(1, "function")).startsWith("Instrumentale"), "contre-exemples : directe sous A, instrumentale sous B");
  if (shots) await page.screenshot({ path: shots + "/04-contre-exemples.png", fullPage: true });

  /* domaine sans exemple */
  await page.locator(".domain-picker summary").click();
  ok((await page.locator(".lamp.off").count()) === 9, "neuf domaines non intégrés dans la liste");
  await page.locator('.lamp[data-domain="equite"]').click();
  ok((await txt(".empty")).includes("Configuration non intégrée à cette version."), "domaine sans exemple");

  /* rubriques */
  await page.goto(url + "#/catalogue");
  ok((await page.locator(".matrix tbody tr").count()) === 11, "catalogue : 11 domaines");
  await page.goto(url + "#/lexique");
  ok((await txt(".page")).includes("Spectre"), "lexique : métaphore optique");
  await page.goto(url + "#/origine/ref-teasdale2021");
  ok((await page.locator("#ref-teasdale2021 a").getAttribute("href")) === "https://doi.org/10.1177/1098214020955226", "origine : DOI Teasdale");
  await page.goto(url + "#/"); await page.reload(); await page.waitForTimeout(300);
  await page.locator('.band[data-slot="0"][data-face="content"]').click();
  await page.locator(".drawer a.chip").first().click();
  await page.waitForTimeout(300);
  ok(page.url().includes("#/origine/") && (await page.locator(".drawer").count()) === 0, "appui documentaire : lien vers l'origine");

  /* impression */
  await page.goto(url + "#/"); await page.reload();
  await page.locator("#print-btn").click();
  ok(missing(await txt("#print-root"), ["Conditions propres au cas", "Teasdale, R. M. (2021)", "Le principe retenu exige", "Justifications cumulées", "Ce qui reste à établir", "Maintenu constant"]).length === 0, "vue imprimable complète");

  /* téléphone */
  const m = await browser.newPage({ viewport: { width: 375, height: 800 } });
  await m.goto(url); await m.waitForTimeout(400);
  ok((await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0, "téléphone : pas de défilement horizontal");
  if (shots) await m.screenshot({ path: shots + "/06-telephone.png", fullPage: true });

  /* animations réduites */
  const rm = await browser.newPage({ viewport: { width: 1100, height: 800 }, reducedMotion: "reduce" });
  await rm.goto(url);
  await rm.locator(".dial").nth(0).focus();
  await rm.keyboard.press("ArrowRight");
  ok((await rm.locator(".dial").nth(0).getAttribute("aria-valuetext")).startsWith("Vertueuse"), "animations réduites : rotation immédiate");

  ok(errs.length === 0, "aucune erreur console" + (errs.length ? " : " + errs.join(" | ") : ""));
  await browser.close();
  console.log(fails ? fails + " échec(s)" : "Toutes les vérifications passent.");
  process.exit(fails ? 1 : 0);
})();
