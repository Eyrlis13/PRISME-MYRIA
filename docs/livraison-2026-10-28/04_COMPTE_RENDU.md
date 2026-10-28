# Compte rendu de livraison · 28 octobre 2026

Branche `maj-2026-10-28`. Le site public (branche `main`) reste en version du 22 octobre tant que l'autrice n'a pas examiné cette prévisualisation.

## Ce qui a changé

- Vocabulaire : volets, issues (autorisée, délimitée, laissée à justifier), portée, garantie. Le contrôle automatique ne trouve plus « rubrique », « fonction », « étayée », « à étayer » ni « périmètre » dans les textes de l'interface ; les exceptions qui restent viennent des textes fournis (voir les arbitrages 1 et 2).
- Accueil : chaîne à quatre maillons, carte « Garantie du jugement » (définition du lexique en second niveau), carte de sortie avec les trois issues et leur définition au survol ou au clavier, phrase sur le prisme, résultat en une phrase visible sans cliquer, deux actions.
- Illustrations : cas construit lu depuis `data/rapports/aides-techniques-domicile.json` ; choix de deux conceptions parmi cinq (petit prisme et cinq boutons par carte) ; la lecture maximisatrice affiche ses deux issues ; le dossier B rend l'issue individualiste « Autorisée », signale que l'issue ciblée ne change pas, et affiche la phrase d'enseignement.
- Rapports : nouvelle page conforme à la section 4 du brief. Le site lit `data/rapports/index.json` ; un rapport s'ajoute en déposant son fichier et en le listant dans l'index (procédure dans `data/rapports/LISEZMOI.md`, vérifiée par un test automatique).
- Sources : mentions, propositions P1 et P2, issues et règle de priorité, lexique en tableau, effectifs 37 / 12 / 6, explorateur des 55 cellules (fermé par défaut ; statuts distingués par la forme du cadre, sans rapport avec les couleurs des issues).

## Contenus retirés ou remplacés (conservés dans `archive/v1.1/` et l'historique git)

- Les textes du 22 octobre (`02_CONTENU_INTERFACE.json`) : lectures S et I des dossiers A et B, phrases d'explication, note sur la confirmation du transfert, usages Audit et Guidance, attributions et questions Q1–Q3 du volet des sources.
- Le modèle de référence V1 (`03_MODELE_SCIENTIFIQUE_REFERENCE.json`) et l'affichage des appuis par fonction.
- La note « Les quatre fonctions sont communes aux cinq conceptions… » (brief du 22 octobre) : la phrase sur le prisme la remplace.
- Les anciens liens continuent d'ouvrir l'entrée de la page avec une indication de mise à jour.

## Arbitrages à trancher par l'autrice

1. **Exemples complémentaires.** J'ai renommé les issues ainsi : accès garanti, lecture normative « Autorisée » et lecture ciblée « Laissée à justifier » ; bénéfice constaté « Autorisée » et supériorité « Laissée à justifier ». L'affirmation ciblée de l'exemple d'accès contient encore « reste à étayer » (« La réponse au besoin de résolution des difficultés reste à étayer. ») : il faut une nouvelle formulation. Le détail du même exemple emploie « la fonction de l'accès » dans un autre sens que les volets.
2. **Cellules du répertoire.** Les textes de M01, M02, M03, M04, S02 et S10 contiennent « périmètre » ou « étayé·e·s », et la règle de S03 parle de « la fonction documentée de l'expérience » ; ces textes sont repris tels quels.
3. **Phrase de comparaison à issues identiques.** Le gabarit dit alors : « Les deux garanties exigent ici les mêmes relations. » Pour ReSanté-Vous E1, les deux lectures sont délimitées mais leurs relations manquantes diffèrent (couverture des personnes accompagnées ; couverture du groupe et niveau de réponse). Dans le dossier B des aides techniques, les deux sont autorisées alors que leurs garanties exigent des relations différentes. Une autre formulation est peut-être préférable dans ces cas.
4. **Mise en phrase des relations manquantes.** Le site insère `relation_manquante` après « La différence tient à » en mettant la première lettre en minuscule, en contractant « à le » en « au », et en réécrivant « Pour la supériorité : la comparaison avec les options » en « La différence tient, pour la supériorité, à la comparaison avec les options ». Quand les deux issues diffèrent sans qu'aucune soit autorisée, la phrase reprend la lecture la plus éloignée de « autorisée ».
5. **Champs ajoutés au fichier du cas construit** (aucune phrase nouvelle) : `issues_detaillees` pour la lecture maximisatrice (« Bénéfice » délimité, « Supériorité sur les options » laissée à justifier, d'après le brief) ; dans la version B, `bandeau` (texte du 22 octobre) et `lacunes` (la lacune sur ce que le changement représente pour chaque personne est retirée, l'autre est conservée).
6. **Version B et conceptions M, V, N.** Les données ne mettent à jour que les lectures S et I ; les trois autres restent affichées comme dans le dossier A, sans repère « inchangée ».
7. **Repères visuels des issues.** Vert, ambre, bleu gris, avec un repère de forme (cercle plein, demi-plein, vide ; cadre en tirets pour « Laissée à justifier ») et le libellé toujours écrit.
8. **Ligne « Lectures fournies : … »** sous chaque énoncé d'un rapport, pour indiquer au visiteur quelles conceptions choisir. Les cases non examinées n'affichent que « Non examinée sous cette conception ».
9. **Textes de 02 non placés** : définitions et particularités des cinq conceptions.
10. **Références sans DOI** : le lexique cite Sadler (1985), Toulmin (1958), Fournier (1995), Gullickson et Hannum (2019), absents de la liste des références de 04.
11. La conception sélectionnée par défaut à l'accueil reste « Centrée sur des parties prenantes ciblées » (le brief v2 ne le précise pas).
12. Toujours ouvert : `recherche/REMISE.json` expose un chemin local OneDrive dans le dépôt public.

## Contrôles effectués

- `node tools/verify-data.js` : 5 conceptions × 4 volets, 55 cellules (37 / 12 / 6, relations ouvertes conformes), 7 DOI, validation complète des deux rapports, de l'index et des illustrations.
- `node tools/ui-check.js` : 332 contrôles sur ordinateur (1320 px), tablette (768 px) et téléphone (375 px) : vocabulaire, chaîne, issues au clavier et au survol, cinq lectures, dossier A/B, trois niveaux de lecture, profil, absence de « null », liens stables, anciens liens, faisceaux et textes sans chevauchement, pas de défilement horizontal, animations réduites, et ajout d'un rapport par dépôt de fichier (copie du site servie en HTTP).
- Captures : `docs/captures/apres-2026-10-22/` (état avant) et `docs/captures/apres-2026-10-28/`.
