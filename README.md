# PRISME MYRIA : Le prisme des critères

Application web statique, en français, qui présente un modèle conceptuel : comment une conception de la valeur sociale oriente la spécification d'un critère de jugement, puis la portée de la conclusion que sa satisfaction permet de soutenir. Elle compare deux prismes (Contenu, Référence de valeur, Fonction) que l'on tourne pour découvrir des justifications différentes.

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
| `js/` | Affichage : `core.js` (utilitaires), `prism.js` (prisme 3D), `views.js` (panneaux), `main.js` (état) |
| `css/` | Styles, y compris la vue imprimable |
| `docs/` | Ajouter une configuration, couverture de cette version |

Le contenu se corrige dans `data/` sans toucher aux composants.

## Choix techniques

JavaScript sans framework, rendu 3D en transformations CSS (sans bibliothèque), scripts classiques pour que l'ouverture directe du fichier fonctionne. Vue plane complète, clavier, `prefers-reduced-motion`, vue imprimable.

Voir `docs/AJOUTER_UNE_CONFIGURATION.md` et `docs/COUVERTURE.md`.
