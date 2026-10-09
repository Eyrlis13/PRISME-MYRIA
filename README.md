# PRISME MYRIA : Le prisme des critères

Application web statique, en français, qui présente un modèle conceptuel : comment une conception de la valeur sociale oriente la spécification d'un critère de jugement, puis la portée de la conclusion que sa satisfaction permet de soutenir.

Deux onglets :

- **Modèle conceptuel** (par défaut) : le trajet d'un faisceau, hors exemple. La propriété à apprécier traverse le prisme de la conception de la valeur ; plusieurs références compatibles en sortent ; une précision argumentée dans la situation en retient une ; elle rejoint le critère (contenu, fonction, référence de valeur). Les deux fonctions conduisent à des conclusions de portée différente. P1 et P2 sont placées sur les relations correspondantes ; un clic sur une relation l'explique et mène à un exemple.
- **Illustrations** : deux prismes que l'on tourne, sur trois cas construits.

Voir `docs/EVOLUTION_CONCEPTUELLE.md`.

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
| `data/` | Contenu scientifique : modèle conceptuel (`modele.js`), domaines, conceptions, références (`catalogue.js`), contextes, configurations et justifications, groupes de comparaison |
| `js/` | Affichage : `core.js` (utilitaires), `model.js` (vue du modèle conceptuel), `bench.js` (prisme des illustrations, que l'on tourne), `views.js` (détails et étape 2 des illustrations), `main.js` (état, routage, illustrations, panneau latéral) |
| `css/` | Styles, y compris la vue imprimable |
| `docs/` | Ajouter une configuration, couverture, évolution conceptuelle, maquettes |

Le contenu se corrige dans `data/` sans toucher aux composants.

## Choix techniques

Charte graphique Myriad (aubergine #3d1a32, prune #58284a, crème #f7f2ea, orange #e4552b ; Montserrat pour les titres, Inter pour le texte). JavaScript sans framework, banc optique en SVG recalculé à chaque rotation, scripts classiques pour que l'ouverture directe du fichier fonctionne. Version texte des illustrations, clavier (flèches, touches 1 à 5, Début ; Échap ferme le panneau latéral), `prefers-reduced-motion`. Les polices Montserrat et Inter sont chargées depuis Google Fonts ; hors ligne, l'application retombe sur les polices système.

Voir `docs/AJOUTER_UNE_CONFIGURATION.md` et `docs/COUVERTURE.md`.
