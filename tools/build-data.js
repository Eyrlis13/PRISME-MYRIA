/*
 * Rassemble les trois fichiers de contenu en un script chargeable sans serveur
 * (l'application fonctionne aussi en ouvrant index.html directement).
 * Usage : node tools/build-data.js
 */
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const data = {
  contenu: read("02_CONTENU_INTERFACE.json"),
  modele: read("03_MODELE_SCIENTIFIQUE_REFERENCE.json"),
  sources: read("04_SOURCES_ET_ATTRIBUTIONS.json"),
};
fs.writeFileSync(path.join(dir, "prisme-data.js"),
  "/* Généré par tools/build-data.js à partir de data/02, 03 et 04. Ne pas modifier à la main. */\n" +
  "window.PRISME_DATA = " + JSON.stringify(data) + ";\n");
console.log("data/prisme-data.js écrit.");
