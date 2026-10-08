# Ajouter une configuration

Tout se fait dans `data/`. Aucun composant à modifier.

1. **Contexte** (`data/contexts.js`) : ajouter un objet `{id, constructed, title, text, recipients, sourceCritere, sourceDonnees}`. Laisser `null` les champs non renseignés.
2. **Configuration** (`data/configurations.js`, tableau `configurations`) : `id` stable, `tag` (étiquette affichée), `domainId`, `conceptionId`, `contextId`, `recipients`, `content` `{short, full, explanation, origin, supports, conditions}`, `justificationIds`, `assessment`, `sources`, `completeness`.
   - `short` : 90 caractères au plus (texte porté par la face).
   - `origin` : `litterature`, `deduction` ou `hypothese`.
   - `assessment.mode` : `conclusion` (texte préparé) ou `formulation` (les implications viennent alors de la situation du groupe).
   - Une valeur `null` reste affichée « Non renseigné ».
3. **Justification** (même fichier, tableau `justifications`) : `{id, configId, valueReference, function, explanation, conditions, supports}`. `function` vaut `null` si elle n'est pas spécifiée : la face affiche alors « Fonction non spécifiée dans cet exemple ». Plusieurs justifications sont possibles : un sélecteur apparaît.
4. **Groupe de comparaison** (`data/comparisons.js`) : ajouter la configuration à `configIds` d'un groupe existant, ou créer un groupe avec `constant`, `varies`, `unspecified` (clés de `PRISME.data.elements`), `contextMode` (`common` ou `per-config`), `hint`, `noticeReading`. Pour un cumul, renseigner `cumul` ; pour des situations, `situations` avec une entrée `byConfig` par configuration.
5. Lancer `node tools/verify-data.js`.

Les domaines et les conceptions ne se modifient que pour une raison scientifique, consignée dans `changelog` (`data/catalogue.js`).
