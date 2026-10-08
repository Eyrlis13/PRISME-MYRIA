/* Vérifications dans un navigateur : node tools/ui-check.js  (nécessite Playwright et Chromium) */
const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const url = "file://" + path.join(__dirname, "..", "index.html");
const shots = process.env.SHOTS || null;
let fails = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "ECHEC ") + m); if (!c) fails++; };
const has = (txt, arr) => arr.filter((s) => !txt.toLowerCase().includes(s.toLowerCase()));

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 1320, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto(url);
  const txt = (sel) => page.locator(sel).first().innerText();
  const active = (i) => page.locator(".prism").nth(i).getAttribute("aria-valuetext");
  const bandText = (i, face) => page.locator("#screen .spec").nth(i).locator(".b-" + face + " .t").innerText();

  /* écran d'entrée */
  ok((await txt("h1")) === "Le prisme des critères", "titre");
  ok((await txt(".tagline")).startsWith("Explorer ce qu'un critère apprécie"), "phrase d'orientation");
  ok((await page.locator(".prism").count()) === 2, "deux prismes");
  ok((await page.locator(".lamp").count()) === 11, "onze domaines à la source");
  ok((await page.locator(".lamp.on").innerText()).includes("Portée et accès"), "domaine allumé : Portée et accès");
  ok((await page.locator(".lamp.off").count()) === 9, "neuf domaines marqués non intégrés");
  ok((await active(0)).includes("Parties prenantes ciblées") && (await active(1)).includes("Normative"), "faces initiales A et B");
  ok((await txt(".sit")).toLowerCase().includes("situation construite"), "signalement situation construite");
  await page.locator(".sit details summary").first().click();
  ok((await txt(".sit")).includes("un principe retenu exige"), "situation : suite dépliable");
  ok((await bandText(0, "content")) === (await bandText(1, "content")), "bandes Contenu identiques");
  ok(has(await txt("#screen .same"), ["identique", "diffèrent"]).length === 0, "ligne identique / diffère");
  ok((await page.locator("#screen .status-identique").count()) === 2, "statut identique sur les deux bandes Contenu");
  ok((await bandText(0, "function")).startsWith("Instrumentale") && (await bandText(1, "function")).startsWith("Directe"), "fonctions A et B");
  if (shots) await page.screenshot({ path: shots + "/01-entree.png", fullPage: true });

  /* étape 2 */
  const s2 = await txt(".stage2");
  ok((await page.locator(".s2card.obs").count()) === 1 && s2.toLowerCase().includes("identique sous a et b"), "constat et standard communs");
  ok(has(s2, ["La possibilité d'accès satisfait le standard retenu.", "Le constat peut établir la satisfaction de cette exigence particulière.", "réalisation du bénéfice administratif", "valeur globale de l'intervention", "doit être étayée", "couvrir les termes de l'exigence"]).length === 0, "conclusions, restes à établir et conditions A et B");
  ok(!(await txt("#app")).match(/\d\s?%/), "aucun pourcentage");

  /* bande : détail */
  await page.locator("#screen .spec").nth(1).locator(".b-reference .band-head").click();
  const det = await page.locator("#screen .spec").nth(1).locator(".b-reference .band-body").innerText();
  ok(has(det, ["Le principe retenu et ses termes doivent être explicités", "Hypothèse de l'exemple", "De la Cruz Jara et Spanjol (2025)"]).length === 0, "détail d'une bande : conditions, origine, appuis");
  await page.locator("#screen .spec").nth(1).locator(".b-function .band-head").click();
  ok((await page.locator("#screen .spec").nth(1).locator(".b-function .band-body").innerText()).includes("ne désigne pas un effet causal direct"), "précision sur « directe »");

  /* rotation par clavier */
  await page.locator(".prism").nth(1).focus();
  await page.keyboard.press("1");
  await page.waitForTimeout(700);
  ok((await active(1)).includes("Maximisatrice") && (await active(1)).includes("non intégrée"), "clavier 1 : Maximisatrice, non intégrée");
  ok((await txt("#screen .spec.placeholder")).includes("Configuration non intégrée à cette version."), "conception non intégrée sur l'écran");
  ok((await page.locator(".prism").nth(1).locator(".lat.active.inert").count()) === 1, "face inerte dessinée");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(700);
  ok((await active(1)).includes("Individualiste"), "flèche droite : face suivante");
  await page.keyboard.press("Home");
  await page.waitForTimeout(700);
  ok((await active(1)).includes("Normative"), "Début : position initiale");

  /* rotation par glissement */
  await page.locator(".prism").nth(0).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const box = await page.locator(".prism").nth(0).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(800);
  ok(!(await active(0)).includes("Parties prenantes ciblées"), "glissement : la face change");
  await page.selectOption("#sel-slot-0", "parties-prenantes-ciblees");
  await page.waitForTimeout(800);
  ok((await active(0)).includes("Parties prenantes ciblées"), "sélecteur : retour à la conception A");
  /* lisibilité : aucun chevauchement de labels sur le SVG */
  const overlaps = await page.$$eval(".prism", (gs) => gs.reduce((n, g) => {
    /* les textes inclinés ont un rectangle englobant plus large que leurs glyphes : on le resserre de 30 % */
    const r = [...g.querySelectorAll("text")].map((t) => { const b = t.getBoundingClientRect(); const ix = b.width * 0.3, iy = b.height * 0.3; return { left: b.left + ix, right: b.right - ix, top: b.top + iy, bottom: b.bottom - iy }; });
    for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++)
      if (r[i].left < r[j].right && r[j].left < r[i].right && r[i].top < r[j].bottom && r[j].top < r[i].bottom) n++;
    return n;
  }, 0));
  ok(overlaps === 0, "aucun chevauchement d'étiquettes sur les prismes");

  /* cumul */
  await page.locator("#cumul-btn").click();
  const cumul = await page.locator("#cumul-panel").innerText();
  ok((await page.locator("#cumul-panel .chain").count()) === 2, "cumul : deux chaînes distinctes");
  ok(cumul.includes("simultanément pour satisfaire une exigence et pour contribuer à un bénéfice") && cumul.includes("laissant le bénéfice administratif à établir") && /moyenn/.test(cumul), "cumul : énoncés et absence de moyenne");
  if (shots) await page.screenshot({ path: shots + "/02-cumul.png", fullPage: true });

  /* vue texte */
  await page.locator("#view-text").click();
  ok((await page.locator(".bench-svg").count()) === 0 && (await page.locator("#screen .spec").count()) === 2, "vue texte : sans banc, spectres présents");
  await page.locator("#screen .spec").nth(0).locator(".b-content .band-head").click();
  const flat = await txt("#screen");
  ok(has(flat, ["Possibilité effective, pour chaque personne du groupe, d'accéder à l'accompagnement administratif.", "Conditions propres au cas", "Teasdale (2021)"]).length === 0, "vue texte : informations complètes");
  await page.selectOption("#sel-slot-1", "vertueuse");
  ok((await txt("#screen .spec.placeholder")).includes("non intégrée"), "vue texte : conception non intégrée");
  await page.locator("#view-bench").click();

  /* pertinence */
  await page.locator('.lamp[data-domain="pertinence"]').click();
  ok((await page.locator(".lamp.on").innerText()).includes("Pertinence"), "source : Pertinence allumée");
  ok((await bandText(0, "content")) !== (await bandText(1, "content")), "pertinence : contenus différents");
  ok((await bandText(0, "function")) === "Fonction non spécifiée dans cet exemple" && (await bandText(1, "function")) === "Fonction non spécifiée dans cet exemple", "fonction non renseignée reste non renseignée");
  ok((await txt(".relation")).includes("peuvent diverger") && (await txt(".stage2")).includes("n'entrent pas dans le champ"), "situation divergence et implications");
  await page.getByLabel("Les démarches administratives correspondent précisément aux usages valorisés").check();
  ok((await txt(".relation")).includes("peuvent converger"), "situation convergence");
  ok((await txt(".situation")).includes("ne résultent pas de la seule conception"), "avertissement : changement de situation");
  ok(!(await txt(".stage2")).includes("satisfait"), "aucune satisfaction annoncée");
  if (shots) await page.screenshot({ path: shots + "/03-pertinence.png", fullPage: true });

  /* contre-exemples */
  await page.locator('.lamp[data-domain="portee-acces"]').click();
  await page.locator(".examples .chip", { hasText: "Contre-exemples" }).click();
  ok((await txt("#context-change")).includes("contre-exemples distincts"), "contre-exemples : changement de contexte signalé");
  ok((await page.locator("#screen .sit").count()) === 2, "contre-exemples : un contexte par spectre");
  ok((await bandText(0, "function")).startsWith("Directe") && (await bandText(1, "function")).startsWith("Instrumentale"), "contre-exemples : directe sous A, instrumentale sous B");
  if (shots) await page.screenshot({ path: shots + "/04-contre-exemples.png", fullPage: true });

  /* domaine sans exemple */
  await page.locator('.lamp[data-domain="equite"]').click();
  ok((await txt(".src .placeholder")).toLowerCase().includes("configuration non intégrée à cette version."), "domaine sans exemple");
  ok((await page.locator("#screen .spec.placeholder").count()) === 2, "domaine sans exemple : deux écrans vides");

  /* rubriques */
  await page.goto(url + "#/catalogue");
  ok((await page.locator(".matrix tbody tr").count()) === 11, "catalogue : 11 domaines");
  await page.goto(url + "#/lexique");
  ok((await txt(".page")).includes("Spectre"), "lexique : métaphore optique");
  await page.goto(url + "#/origine/ref-teasdale2021");
  ok((await page.locator("#ref-teasdale2021 a").getAttribute("href")) === "https://doi.org/10.1177/1098214020955226", "origine : DOI Teasdale");
  ok((await page.locator(".ref").count()) === 5, "origine : 5 références");
  await page.goto(url + "#/"); await page.reload();
  await page.locator("#screen .spec").nth(0).locator(".b-content .band-head").click();
  await page.locator("#screen .chip").first().click();
  await page.waitForTimeout(300);
  ok(page.url().includes("#/origine/"), "appui documentaire : lien vers l'origine");

  /* impression */
  await page.goto(url + "#/"); await page.reload();
  await page.locator("#print-btn").click();
  const pr = await txt("#print-root");
  ok(has(pr, ["Conditions propres au cas", "Teasdale, R. M. (2021)", "Le principe retenu exige", "Justifications cumulées", "Ce qui reste à établir", "Maintenu constant"]).length === 0, "vue imprimable : conditions, conclusions, références");
  if (shots) await page.screenshot({ path: shots + "/05-imprimable.png", fullPage: true });

  /* téléphone */
  const m = await browser.newPage({ viewport: { width: 375, height: 800 } });
  await m.goto(url);
  const hs = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(hs <= 0, "téléphone : pas de défilement horizontal");
  if (shots) await m.screenshot({ path: shots + "/06-telephone.png", fullPage: true });

  /* réduction des animations : rotation immédiate */
  const rm = await browser.newPage({ viewport: { width: 1000, height: 800 }, reducedMotion: "reduce" });
  await rm.goto(url);
  await rm.locator(".prism").nth(0).focus();
  await rm.keyboard.press("ArrowRight");
  ok((await rm.locator(".prism").nth(0).getAttribute("aria-valuetext")).includes("Vertueuse"), "réduction des animations : rotation sans animation");

  ok(errs.length === 0, "aucune erreur console" + (errs.length ? " : " + errs.join(" | ") : ""));
  await browser.close();
  console.log(fails ? fails + " échec(s)" : "Toutes les vérifications passent.");
  process.exit(fails ? 1 : 0);
})();
