# Compte rendu de livraison · 22 octobre 2026

Branche `maj-2026-10-22`. Le site public (branche `main`) n'est pas modifié tant que l'autrice n'a pas examiné cette version.

## Contenus déplacés

- Le bloc « Confrontation du dossier aux exigences » est intégré au bloc B, Critère et appréciation.
- Le dossier évaluatif commun quitte le schéma de l'accueil pour un bandeau sous la chaîne (texte `dossier_commun`, détail dépliable).
- « Statut et références » devient le volet « Sources et construction du modèle », ouvert depuis l'en-tête (« Sources ») et le pied de page des deux pages.
- La précision sur l'absence d'attribution causale au seul aménagement est dans « Sources et prémisses de cet exemple », à côté des prémisses du cas.
- Le pied de page devient « Modèle conceptuel · illustrations construites », suivi du lien vers les sources.

## Retiré du parcours, conservé dans `archive/v1.0/` et l'historique git

- Les quinze cas C01–C15 et leurs 75 lectures, le sélecteur de cas, les raccourcis, les analyses des 25 paires et les variantes de sensibilité (`archive/v1.0/PRISME_MAJ_2026-10-16.json`).
- Les libellés de la version 1.0 (`archive/v1.0/interface-fr.js`) et le code des pages (`archive/v1.0/*.js`).
- La formule « explicitée par le forum ».
- Les anciens liens (`#/illustrations/…`, `#/catalogue`, `#/origine`, `#/lexique`, etc.) ouvrent l'entrée de la page correspondante avec l'indication : « Ce lien renvoie à une version antérieure de PRISME. Les anciens cas ont été retirés du parcours lors de la mise à jour du 22 octobre 2026. » Aucun contenu ne leur est substitué.

## Arbitrages à trancher par l'autrice

1. Deux phrases du brief, absentes de 02, sont-elles des textes d'interface ? J'ai affiché la première dans le bloc B : « Les quatre fonctions sont communes aux cinq conceptions. Les flèches représentent leur articulation argumentative ; une évaluation peut procéder par allers-retours. » Je n'ai pas affiché la seconde (« Le modèle peut servir aux échanges entre organisation, destinataires et forum »).
2. Dans le dossier B, chaque carte porte un repère « Conclusion inchangée » ou « Conclusion actualisée », calculé en comparant l'affirmation de A et de B. Ce libellé n'est pas dans 02.
3. Provenance des conceptions : 02 ne renseigne pas qui formule la référence ni dans quel contexte. Seule la typologie est attribuée (lien vers de la Cruz Jara et Spanjol, 2025).
4. Le répertoire des 55 croisements n'est pas publié sur le site ; le volet des sources en donne le décompte, sans lien.
5. Années : le registre date de 2023 l'article de Benjamin, Ebrahim et Gugerty, paru en ligne en 2022 (Crossref). Pour de la Cruz Jara et Spanjol, 02 mentionne déjà la publication en ligne de 2024.
6. Toujours ouvert : `recherche/REMISE.json` contient un chemin local OneDrive, visible dans le dépôt public.

## Contrôles effectués

- `node tools/verify-data.js` : empreinte SHA-256 du modèle conforme à 04 ; textes des conceptions, questions et explications identiques entre 02 et 03 ; références résolues ; lacune de A absente de B.
- `node tools/ui-check.js` : 289 contrôles sur ordinateur (1320 px), tablette (768 px) et téléphone (375 px), dont clavier, animations réduites, conservation de l'état à l'ouverture des volets, anciens liens, absence de faisceau sur un texte et de défilement horizontal.
- Les sept DOI sont enregistrés chez Crossref ; titres et auteurs concordent avec 04.
- Captures : `docs/captures/avant-2026-10-22/` et `docs/captures/apres-2026-10-22/`.
