# PRISME MYRIA : Le prisme des critères

Application web statique, en français, qui présente un modèle conceptuel : comment une conception de la valeur sociale oriente la spécification d'un critère de jugement, puis la portée de la conclusion que sa satisfaction permet de soutenir.

Lecture optique retenue (version 0.2) : un domaine de critères entre comme lumière blanche, traverse un prisme pentagonal dont chaque face est une conception, et ressort en spectre à trois bandes (contenu, référence de valeur, fonction). Deux prismes côte à côte reçoivent le même rayon ; l'écran compare leurs spectres. Voir `docs/EVOLUTION_CONCEPTUELLE.md`.

Projet indépendant d'Ergothèque et d'ESM.

## Lancement

Aucune installation. Aucune dépendance. Aucun serveur métier.

- Ouvrir `index.html` dans un navigateur récent, ou
- `./serve.sh` puis http://localhost:8080

## Vérifications

```
node tools/verify-data.js      # intégrité des données (références, cohérence des groupes)
node tools/ui-check.js         # comportements dans Chromium (nécessite Playwright)
```

## Organisation

| Dossier | Contenu |
|---|---|
| `data/` | Contenu scientifique : domaines, conceptions, références (`catalogue.js`), contextes, configurations et justifications, groupes de comparaison |
| `js/` | Affichage : `core.js` (utilitaires), `bench.js` (banc optique SVG), `views.js` (écran, étape 2, rubriques, impression), `main.js` (état) |
| `css/` | Styles, y compris la vue imprimable |
| `docs/` | Ajouter une configuration, couverture, évolution conceptuelle, maquettes |

Le contenu se corrige dans `data/` sans toucher aux composants.

## Choix techniques

Charte graphique Myriad (aubergine #3d1a32, prune #58284a, crème #f7f2ea, orange #e4552b ; Montserrat pour les titres, Inter pour le texte). JavaScript sans framework, banc optique en SVG recalculé à chaque rotation, scripts classiques pour que l'ouverture directe du fichier fonctionne. Vue texte sans banc optique, clavier (flèches, touches 1 à 5, Début), `prefers-reduced-motion`, vue imprimable. Les polices Montserrat et Inter sont chargées depuis Google Fonts ; hors ligne, l'application retombe sur les polices système.

Voir `docs/AJOUTER_UNE_CONFIGURATION.md` et `docs/COUVERTURE.md`.
