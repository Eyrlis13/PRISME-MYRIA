/*
 * Rassemble les fichiers de contenu en un script chargeable sans serveur
 * (l'application fonctionne aussi en ouvrant index.html directement).
 * Les rapports (data/rapports/) sont lus à l'exécution depuis index.json ; la copie
 * incluse ici ne sert que lorsque la page est ouverte comme fichier local.
 * Usage : node tools/build-data.js
 */
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const index = read("rapports/index.json");
const data = {
  modele: read("02_CONTENU_MODELE_v2.json"),
  illustrations: read("illustrations.json"),
  sources: read("04_SOURCES_ET_ATTRIBUTIONS.json"),
  rapports: { index: index, fichiers: index.fichiers.map((f) => read("rapports/" + f)) },
};
fs.writeFileSync(path.join(dir, "prisme-data.js"),
  "/* Généré par tools/build-data.js. Ne pas modifier à la main. */\n" +
  "window.PRISME_DATA = " + JSON.stringify(data) + ";\n");
console.log("data/prisme-data.js écrit (" + index.fichiers.length + " rapports inclus pour l'ouverture locale).");
