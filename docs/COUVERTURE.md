# Couverture de la version 1.1 (22 octobre 2026)

## Contenu intégré (`data/02_CONTENU_INTERFACE.json`)

- Accueil : titre, sous-titre, énoncé du modèle, chaîne en trois blocs, conception initiale, sortie, dossier commun et son détail, appel vers l'exemple, usages Audit et Guidance avec leurs exemples.
- Cinq conceptions (M, I, S, V, N) : nom, raison courte, formulation par rubrique. La provenance (`source_typologie`) est rendue par le lien « Typologie : de la Cruz Jara et Spanjol (2025) ».
- Quatre fonctions : intitulé, terme, question, explication.
- Démonstration guidée : versions A et B, lectures S et I (affirmation, libellé de conclusion, périmètre, pourquoi, quatre rubriques), explications, boutons, note de complément, prémisses, limite, construction, origine, sources.
- Deux exemples complémentaires, statiques.
- Documentation : attributions, questions Q1–Q3, propositions 1 et 2, note de statut, décompte du répertoire.

## Contenu de `03` et `04` affiché dans le volet des sources

- `03` : contenu et « absence » de chaque rubrique, justification du regroupement, ce qui reste à éprouver, version et statut. Le reste sert au contrôle de fidélité (`tools/verify-data.js` compare 02 et 03 phrase à phrase).
- `04` : les sept références avec lien DOI, rôle et passages ; appuis par fonction ; précision sur Fournier (1995).

## Champs non affichés

- `arguments` (identifiants ARG-…) et `argument_repere` : repères internes au manuscrit.
- `traduction_evaluative`, `correspondances_manuscrit` : correspondances avec le manuscrit, non publiées.
- `information_ajoutee` : son contenu est déjà dans `faits_communs` de B ; l'interface met en évidence les phrases de B absentes de A, et `verify-data.js` contrôle leur concordance.
- `etat_interface` : consignes de comportement, appliquées et testées.

## Libellés d'interface ajoutés (hors 02)

« Le modèle · », « Question et explication », « Détail », « Exemple · », « Dossier commun », « Version A · dossier initial », « Conclusion », « Périmètre », « Pourquoi », « Conclusion inchangée / actualisée », « Prémisses », « Limite », « Construction », « Origine », « Sources », « Traçabilité », et l'indication donnée aux anciens liens. La note sur les fonctions communes et les allers-retours reprend le texte du brief.
