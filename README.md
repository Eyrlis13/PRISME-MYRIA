# PRISME MYRIA · Ce qu’une conception de la valeur sociale autorise à conclure

Application web statique, en français. PRISME montre comment la conception de la valeur mobilisée par une évaluation décide de ce qu’une performance observée permet d’affirmer sur la valeur sociale d’une action.

- **Accueil** (`#/`) : la chaîne Conception de la valeur sociale → Garantie du jugement → Spécification du critère en quatre volets → Affirmation de valeur et son issue. Le prisme et cinq boutons choisissent la conception ; les quatre volets affichent la formulation correspondante. Sous la chaîne : le résultat en une phrase, le dossier commun, deux actions, deux usages.
- **Illustrations** (`#/illustrations`) : le cas construit des aides techniques, lu par deux conceptions au choix parmi cinq ; « Ajouter l’appréciation des personnes » crée le dossier B. Deux exemples complémentaires suivent.
- **Rapports** (`#/rapports`, `#/rapports/<identifiant>`) : analyses de rapports d’impact préparées hors du site, un fichier JSON par rapport (`data/rapports/`). Pour chaque énoncé : issues sous deux conceptions et phrase de comparaison, puis les quatre volets, puis les passages et les prémisses ; en bas, le profil du rapport.
- **Sources et construction du modèle** : volet latéral (en-tête et pied de page) avec mentions, propositions, issues, lexique et explorateur des 55 cellules.

Modèle conceptuel ; aucune validation empirique revendiquée. Aucun poids, seuil, veto ou score.

## Lancement

Ouvrir `index.html` dans un navigateur, ou `./serve.sh` puis http://localhost:8080. Aucune dépendance. Ouverte comme fichier local, la page Rapports utilise la copie des rapports incluse dans `data/prisme-data.js` ; servie (GitHub Pages, `serve.sh`), elle lit `data/rapports/index.json`.

## Données

| Fichier | Rôle |
|---|---|
| `data/02_CONTENU_MODELE_v2.json` | Textes du modèle révisé du 28 octobre (accueil, volets, issues, lexique, conceptions, propositions, usages, 55 cellules, mentions) |
| `data/rapports/` | Un fichier par rapport, `index.json` (liste et rapport par défaut), `schema.json`, `LISEZMOI.md` (ajouter un rapport) |
| `data/illustrations.json` | Titre, mention et boutons de la démonstration, exemples complémentaires (textes du 22 octobre, issues renommées) |
| `data/04_SOURCES_ET_ATTRIBUTIONS.json` | Références avec DOI |
| `data/prisme-data.js` | Copie chargeable, générée par `node tools/build-data.js` |
| `docs/livraison-2026-10-28/` | Brief v2, fichiers fournis et compte rendu de livraison |
| `archive/` | Versions précédentes (dont le modèle V1 et les textes du 22 octobre) |

## Vérifications

```
node tools/build-data.js     # régénère data/prisme-data.js
node tools/verify-data.js    # modèle, répertoire 37 / 12 / 6, DOI, validation de chaque rapport
node tools/ui-check.js       # critères de réception : trois pages, trois largeurs, clavier, animations réduites, ajout d'un rapport
SHOTS=docs/captures/apres-2026-10-28 node tools/ui-check.js   # idem, avec captures
```

## Organisation du code

`js/core.js` (données, issues, phrase de comparaison, chargement des rapports), `js/bench.js` (prisme, repère miniature, sélecteur de conception), `js/ui.js` (panneau latéral, volet des sources), `js/model.js` (accueil), `js/illus.js` (illustrations, dossier, lectures), `js/rapports.js` (page Rapports), `js/main.js` (routage, état, anciens liens). Charte Myriad : aubergine #3d1a32, prune #58284a, crème #f7f2ea, orange #e4552b ; Montserrat et Inter.
