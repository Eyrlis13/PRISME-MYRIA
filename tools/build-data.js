/*
 * Transforme le fichier scientifique JSON en script chargeable sans serveur
 * (l'application fonctionne aussi en ouvrant index.html directement).
 * Usage : node tools/build-data.js
 */
const fs = require("fs");
const path = require("path");
const src = path.join(__dirname, "..", "data", "PRISME_MAJ_2026-10-16.json");
const out = path.join(__dirname, "..", "data", "prisme-data.js");
const json = JSON.parse(fs.readFileSync(src, "utf8"));
fs.writeFileSync(out,
  "/* Généré par tools/build-data.js à partir de data/" + path.basename(src) + ". Ne pas modifier à la main. */\n" +
  "window.PRISME_DATA = " + JSON.stringify(json) + ";\n");
console.log("data/prisme-data.js écrit (" + json.cases.length + " cas).");
