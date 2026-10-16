# PRISME MYRIA · Le prisme du jugement

Application web statique, en français : comment une conception de la valeur sociale intervient dans le jugement porté sur l'action d'une organisation.

- **Modèle conceptuel** (par défaut) : la lecture évaluative traverse le prisme de la conception et rejoint les quatre dimensions des exigences de justification (qualification, portée, preuve, règle d'appréciation). Le dossier évaluatif commun forme une entrée distincte. Les deux rejoignent la confrontation, qui autorise et délimite un jugement justifié. On peut faire tourner le prisme pour voir l'orientation générique de chacune des cinq conceptions, sans cas ni verdict.
- **Illustrations** : quinze dossiers construits, lus par deux conceptions au choix (A et B). Le dossier reste identique ; chaque rotation actualise les quatre dimensions, la conclusion autorisée, sa justification et sa limite.

Modèle conceptuel proposé et situations construites ; aucun test empirique. Aucun score, aucune pondération, aucun classement des conceptions.

## Lancement

Ouvrir `index.html` dans un navigateur, ou `./serve.sh` puis http://localhost:8080. Aucune dépendance.

## Données

| Fichier | Rôle |
|---|---|
| `data/PRISME_MAJ_2026-10-16.json` | Fichier scientifique de référence (modèle, profils, cas, sources, analyses, contrôles) |
| `data/prisme-data.js` | Copie chargeable du JSON, générée par `node tools/build-data.js` après toute modification du JSON |
| `data/interface-fr.js` | Libellés d'interface, couleurs des dimensions, condensations à relire |
| `recherche/` | Registre, rapports et scripts de recherche fournis par l'autrice |
| `archive/v0.5/` | Ancienne organisation (contenu, référence de valeur, fonction ; P1/P2), conservée pour mémoire |

## Vérifications

```
node tools/build-data.js     # régénère data/prisme-data.js
node tools/verify-data.js    # 75 lectures complètes, empreintes des dossiers, références
node tools/ui-check.js       # deux pages, 75 lectures, dossier constant, mobile, clavier (Playwright)
```

## Organisation du code

`js/core.js` (accès aux données), `js/bench.js` (prisme rotatif), `js/ui.js` (panneau latéral, cartes de dimension, références), `js/model.js` (page Modèle), `js/illus.js` (page Illustrations), `js/main.js` (routage et état). Charte Myriad : aubergine #3d1a32, prune #58284a, crème #f7f2ea, orange #e4552b ; Montserrat et Inter.
