# Ajouter un rapport

1. Rédiger l'analyse au format de `schema.json` (champ `schema`), dans un fichier `<identifiant>.json` placé dans ce dossier. L'identifiant est en minuscules, chiffres et tirets, et le nom du fichier le reprend : `resante-vous-2024` → `resante-vous-2024.json`.
2. Ajouter le nom du fichier à la liste `fichiers` de `index.json`. L'ordre de cette liste est celui du menu de la page Rapports ; `par_defaut` désigne le rapport affiché au chargement.
3. Lancer `node tools/verify-data.js`. Les erreurs (champ manquant, issue inconnue, cellule inexistante, cellule d'une autre conception) bloquent ; les avertissements signalent un point à relire.
4. Facultatif : `node tools/build-data.js` met à jour la copie utilisée lorsque la page est ouverte comme fichier local. Sur le site publié, la page lit directement `index.json` et les fichiers listés.

Aucune modification du code n'est nécessaire. Un fichier listé mais absent ou illisible est ignoré.

## Conventions d'affichage

- Un champ facultatif sans contenu vaut `null` (par exemple `standard`, `relation_manquante`, `premisse_ajoutee`) ; la ligne correspondante est alors masquée.
- Une conception sans lecture pour un énoncé est listée dans `non_examine_sous` ; la page affiche « Non examinée sous cette conception ».
- La phrase de comparaison est composée d'après `comparaison_template`. Lorsque les deux issues diffèrent, elle reprend `relation_manquante` et `ce_qui_changerait_l_issue` de la lecture la plus éloignée de « autorisée ». Rédiger ces deux champs comme des groupes nominaux ou des phrases qui peuvent suivre « La différence tient à » et « Ce qui changerait l'issue : ».

## Champs ajoutés au schéma pour cette livraison (à valider par l'autrice)

- `issues_detaillees` (dans une lecture) : liste `{ "porte_sur", "issue" }`, lorsque la lecture porte plusieurs issues. Elle est utilisée pour la lecture maximisatrice du cas construit (bénéfice délimité, supériorité laissée à justifier).
- `bandeau` et `lacunes` (dans une version du dossier) : le texte qui annonce la nouvelle version et la liste des lacunes qui restent après l'ajout d'information.
