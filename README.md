# PRISME MYRIA · Comment la conception de la valeur oriente le jugement

Application web statique, en français, version 2.0 (31 octobre 2026). Elle met en ligne le modèle de l'article « Same evidence, different judgements: Conceptions of social value as the backing of evaluative warrants » : la conception de la valeur sociale fonde la garantie qui mène des preuves d'un dossier à une revendication de valeur.

- **Modèle conceptuel** (`#/`) : le prisme choisit la conception, un sélecteur choisit le domaine de critères (onze domaines de Teasdale). Les quatre cartes donnent la spécification de la garantie pour ce croisement (raison de valoriser, portée, preuves exigées, règle d'appréciation), avec son statut et ses appuis ; la carte du verdict rappelle les trois verdicts et la réfutation. Suivent les trois propositions et les deux usages.
- **Illustration** (`#/illustration`) : l'expérience de pensée de l'article. Même dossier, même revendication ; deux prismes orientables donnent chacun une lecture ; les versions B, C et D ajoutent une preuve ou étendent la portée.
- **Rapports** (`#/rapports`) : des rapports d'impact analysés avec le modèle. Pour chaque revendication, deux prismes orientables ; pour les conceptions normative et vertueuse, choix du principe ou de l'obligation, ou saisie libre (l'application prépare la demande à coller dans Claude Code).
- **Sources** : volet latéral (construction, composantes, verdicts, propositions, références).

## Ajouter un rapport

Dans Claude Code, sur ce dépôt : donner le rapport et demander de l'analyser avec PRISME. La compétence `.claude/skills/prisme-rapport` applique les règles et les 55 spécifications, écrit `data/rapports/<id>.json`, reconstruit et contrôle les données.

## Lancement

Ouvrir `index.html` dans un navigateur, ou `./serve.sh` puis http://localhost:8080. Aucune dépendance.

## Données

| Fichier | Rôle |
|---|---|
| `data/02_CONTENU_INTERFACE.json` | Textes de l'interface, lexique, domaines, verdicts, propositions |
| `data/03_MODELE_PRISME.json` | Les 55 spécifications (matériel supplémentaire S1, traduit), avec leurs appuis |
| `data/04_SOURCES_ET_ATTRIBUTIONS.json` | Références de l'article |
| `data/06_ILLUSTRATION.json` | L'expérience de pensée (dossiers A à D, lectures) |
| `data/rapports/*.json` | Rapports analysés |
| `data/prisme-data.js` | Copie chargeable, générée par `node tools/build-data.js` |
| `archive/v1.1/` et antérieures | Versions précédentes |

## Vérifications

```
node tools/build-data.js     # régénère data/prisme-data.js
node tools/verify-data.js    # 55 croisements, décompte des statuts, schéma des rapports
node tools/ui-check.js       # trois pages, trois largeurs (serveur local sur le port 8090)
```

## Organisation du code

`js/core.js` (données), `js/bench.js` (prisme rotatif et repère miniature), `js/ui.js` (panneau latéral et sources), `js/model.js` (modèle conceptuel), `js/lecture.js` (panneau à deux prismes), `js/illus.js` (illustration), `js/rapports.js` (rapports), `js/main.js` (routage, état). Charte Myriad : aubergine #3d1a32, prune #58284a, crème #f7f2ea, orange #e4552b ; Montserrat et Inter.
