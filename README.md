# PRISME MYRIA · Comment la conception de la valeur oriente le jugement

Application web statique, en français. PRISME relie la raison de valoriser une action aux critères retenus et aux conclusions que leur appréciation permet de soutenir.

- **Accueil** (`#/`) : la chaîne Conception de la valeur → Critère et appréciation → Jugement justifié. Le prisme et cinq boutons nommés choisissent la conception (Parties prenantes ciblées par défaut) ; les quatre rubriques (qualification, portée, preuve, règle d'appréciation) affichent la formulation courte correspondante, avec question et explication à déplier. Sous la chaîne : le dossier commun, l'accès à l'exemple, et les deux usages (audit, guidance).
- **Illustrations** (`#/illustrations`) : démonstration guidée sur les aides techniques à domicile. Le dossier A est lu par les conceptions Parties prenantes ciblées et Individualiste ; « Ajouter l'appréciation des personnes » crée le dossier B et actualise les deux lectures ; « Revenir au dossier initial » rétablit A. Deux exemples complémentaires suivent, fermés par défaut.
- **Sources et construction du modèle** : volet latéral accessible depuis l'en-tête et le pied de page des deux pages ; son ouverture ne modifie ni le dossier ni les choix courants.

Modèle conceptuel et illustrations construites. Aucun poids, seuil, veto ou score.

## Lancement

Ouvrir `index.html` dans un navigateur, ou `./serve.sh` puis http://localhost:8080. Aucune dépendance.

## Données

| Fichier | Rôle |
|---|---|
| `data/02_CONTENU_INTERFACE.json` | Textes de l'interface (fixés par l'autrice) |
| `data/03_MODELE_SCIENTIFIQUE_REFERENCE.json` | Modèle V1 de référence, pour le contrôle de fidélité |
| `data/04_SOURCES_ET_ATTRIBUTIONS.json` | Références avec DOI, appuis par fonction, empreinte du modèle |
| `data/prisme-data.js` | Copie chargeable des trois fichiers, générée par `node tools/build-data.js` |
| `docs/livraison-2026-10-22/` | Brief du 22 octobre et compte rendu de livraison |
| `archive/v1.0/`, `archive/v0.5/` | Versions précédentes (dont les quinze cas C01–C15), conservées pour mémoire |
| `recherche/` | Registre, rapports et scripts de recherche fournis par l'autrice |

## Vérifications

```
node tools/build-data.js     # régénère data/prisme-data.js
node tools/verify-data.js    # empreinte du modèle, fidélité 02/03, DOI, dossier A → B
node tools/ui-check.js       # critères de réception, ordinateur, tablette, téléphone, clavier, animations réduites
SHOTS=docs/captures/apres-2026-10-22 node tools/ui-check.js   # idem, avec captures
```

## Organisation du code

`js/core.js` (accès aux données), `js/bench.js` (prisme rotatif et repère miniature), `js/ui.js` (panneau latéral, références, volet des sources), `js/model.js` (accueil), `js/illus.js` (illustrations), `js/main.js` (routage, état, anciens liens). Charte Myriad : aubergine #3d1a32, prune #58284a, crème #f7f2ea, orange #e4552b ; Montserrat et Inter.
