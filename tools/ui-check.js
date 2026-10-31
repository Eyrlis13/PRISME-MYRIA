/*
 * Contrôle d'affichage : node tools/ui-check.js (serveur local sur le port 8090, ou BASE=…)
 * Charge les trois pages sur trois largeurs, fait tourner un prisme, change de domaine,
 * de version du dossier et de revendication, et signale toute erreur. SHOTS=dossier pour des captures.
 */
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:8090/";
const SHOTS = process.env.SHOTS || "";
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const [name, w, hgt] of [["ordinateur", 1280, 900], ["tablette", 900, 1100], ["telephone", 390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: hgt } });
    p.on("pageerror", (e) => errs.push(name + " : " + e.message));
    p.on("console", (m) => { if (m.type() === "error") errs.push(name + " : " + m.text()); });
    await p.goto(BASE + "#/", { waitUntil: "networkidle" });
    await p.selectOption("#dom-select", "D06");
    await p.click('.c-btn[data-c="N"]');
    await p.waitForTimeout(700);
    const t = await p.textContent(".rub[data-f='raison'] .rub-f");
    if (!t || t.length < 20) errs.push(name + " : formulation vide (N06)");
    await p.selectOption("#dom-select", "D05"); await p.click('.c-btn[data-c="V"]'); await p.waitForTimeout(700);
    if (!(await p.$(".model.is-open"))) errs.push(name + " : V05 devrait être ouvert");
    if (SHOTS) await p.screenshot({ path: SHOTS + "/" + name + "-modele.png", fullPage: true });
    await p.goto(BASE + "#/illustration", { waitUntil: "networkidle" });
    for (const v of ["B", "C", "D", "A"]) { await p.click(".ver-seg .chip:has-text('" + (v === "A" ? "Dossier initial" : v + " ·") + "')"); await p.waitForTimeout(150); }
    if (SHOTS) await p.screenshot({ path: SHOTS + "/" + name + "-illustration.png", fullPage: true });
    await p.goto(BASE + "#/rapports", { waitUntil: "networkidle" });
    const chips = await p.$$(".rev-seg .chip");
    for (let i = 0; i < chips.length; i++) { const cs = await p.$$(".rev-seg .chip"); await cs[i].click(); await p.waitForTimeout(120); }
    if (SHOTS) await p.screenshot({ path: SHOTS + "/" + name + "-rapports.png", fullPage: true });
    const over = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (over) errs.push(name + " : défilement horizontal");
    await p.close();
  }
  await b.close();
  if (errs.length) { console.error("ÉCHEC\n- " + errs.join("\n- ")); process.exit(1); }
  console.log("Affichage conforme sur ordinateur, tablette et téléphone.");
})();
