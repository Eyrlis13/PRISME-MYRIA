---
name: prisme-rapport
description: Analyse un rapport d'impact social avec le modèle PRISME (cinq conceptions de la valeur sociale, garantie en quatre composantes, verdicts étayée / bornée / en suspens) et l'ajoute à l'application PRISME MYRIA. À utiliser quand l'utilisatrice donne un rapport à analyser, ou demande de « réévaluer la revendication Rk du rapport X sous le principe / l'obligation : … ».
---

# PRISME · analyser un rapport et l'ajouter à l'application

Tu appliques le modèle de l'article « Same evidence, different judgements: Conceptions of social value as the backing of evaluative warrants » (Zouakh). La conception de la valeur sociale fonde la garantie qui mène des preuves d'un dossier à une revendication de valeur. Tout ce qu'il faut est dans ce dépôt :

- `data/03_MODELE_PRISME.json` : les 55 spécifications (5 conceptions × 11 domaines), clé `M01` … `N11` (lettre de la conception + numéro du domaine). Chaque spécification donne `statut` (Proposed, Exploratory, Open), `raison`, `portee`, `preuves`, `regle`, `refutation`, `question`.
- `data/02_CONTENU_INTERFACE.json` : lexique, définitions des verdicts, des statuts, des onze domaines (`D01` … `D11`).
- `data/06_ILLUSTRATION.json` : un exemple complet de lectures (garantie, verdict, manque, revendication avec intégrité) à imiter pour le ton et la précision.

## 1. Lire le rapport

Extrais le texte avec les numéros de page imprimés (pas ceux du lecteur PDF : vérifie un pied de page). Repère l'action, les destinataires, les données recueillies (qui, combien, quand, comment) et ce que le rapport dit lui-même de ses limites.

## 2. Retenir les revendications

Une revendication est un énoncé selon lequel l'action a créé de la valeur sociale à un certain égard, avec les passages qui en donnent la propriété, la raison et la portée. Retiens 4 à 8 revendications, de préférence celles qui s'appuient sur des données ; garde au moins une revendication de principe (inclusion, droits, dignité…) si le rapport en porte. Pour chacune :

- `enonce` : la revendication telle que le rapport l'affirme, reformulée en une phrase fidèle ;
- `court` : 2 à 4 mots pour l'onglet ;
- `citation` : le passage exact (guillemets français ajoutés par l'appli, ne pas les mettre) ;
- `pages` : « p. 44 » ou « p. 44–45 » ;
- `domaine` : le domaine de critères (`D01` … `D11`) ;
- `propriete`, `portee` : la propriété appréciée et la portée affirmée ;
- `preuves` : la liste des éléments que le rapport fournit (`texte`, `pages`), sans rien ajouter ;
- `conception_invoquee` : `{ "id": "S", "mode": "explicite" | "reconstruite", "premisse": "…" }`, ou `{ "id": null, "mode": "aucune" }`. Une conception reconstruite exige une prémisse énoncée : le nom d'un indicateur, d'une méthode ou l'identité des répondants ne suffit pas à l'attribuer.

## 3. Lire chaque revendication sous les cinq conceptions

Pour chaque conception `M`, `I`, `S`, `V`, `N`, pars de la spécification du croisement (conception × domaine de la revendication) et formule la garantie pour le cas, en quatre champs courts : `raison`, `portee`, `preuves`, `regle`. Puis rends le verdict sur la revendication telle qu'elle est affirmée :

- `etayee` : le rapport contient les preuves que la garantie exige pour la portée affirmée ;
- `bornee` : les preuves étayent la même revendication (même raison de valoriser) sur une portée plus étroite ;
- `suspens` : une relation que la garantie exige manque de preuves. Si la revendication dépasse sa portée ET manque une relation exigée, le verdict est `suspens` ;
- `ouvert` : le croisement est ouvert (`statut` Open) ; `manque` dit alors pourquoi la conception ne lit pas cette revendication, et `integre` est vide.

Règles qui comptent :
- Individualiste : l'appréciation de la personne elle-même fait partie des preuves exigées ; l'avis d'un tiers ne la remplace pas sans justification de représentation. Réfutation type : l'adaptation (une appréciation favorable peut exprimer une adaptation à la situation).
- Parties prenantes ciblées : le besoin doit avoir été identifié avec le groupe ; distinguer réalisation immédiate et changement durable ; une revendication sur tout le groupe exige la couverture.
- Maximisatrice : le caractère net du bénéfice fait partie de la raison de valoriser ; un gain chez les participants laisse en suspens un bénéfice pour le système tant que les effets sur ses autres composantes et les ressources consommées ne sont pas documentés.
- Vertueuse : les preuves portent sur l'obligation de l'agent, l'engagement qu'elle soutient et les bénéfices qu'il anticipe ; la règle examine la cohérence entre l'obligation et la conduite. Une revendication d'effet produit appelle une seconde garantie : elle reste en suspens sous cette conception, et la revendication avec intégrité énonce ce que l'engagement documenté permet de dire.
- Normative : le principe et son champ d'application ; la propriété exigée peut être un accès, un traitement ou un effet ; il faut des preuves de ce que l'organisation met en œuvre, pas seulement de ce qu'elle énonce.
- Une absence de preuve laisse la revendication en suspens ; elle ne la réfute pas.

Champs de chaque lecture : `garantie`, `verdict`, `manque` (la relation à documenter, ou « Rien pour cette portée. »), `integre` (la revendication que les preuves du rapport étayent sous la même garantie, formulée avec ses chiffres et ses conditions), et `statut_croisement` (recopié de la spécification).

Pour `V` et `N`, la garantie dépend de l'obligation ou du principe invoqué : remplace la lecture par `{ "statut_croisement": …, "options": [ … ] }`. Mets d'abord les obligations ou principes que le rapport énonce lui-même (`source` : « rapport, p. 41 »), puis un ou deux que le champ invoque couramment pour ce type d'action (`source` : « proposé par l'analyse »). Chaque option a `id`, `libelle` et les champs d'une lecture.

## 4. Écrire le fichier

Écris `data/rapports/<id>.json` (id en minuscules, sans accents, ex. `resante-vous-2024`) :

```json
{
  "id": "resante-vous-2024",
  "titre": "…", "organisation": "…", "annee": 2024,
  "perimetre": "Une phrase sur l'action et ses destinataires.",
  "donnees": "Une phrase sur les données : qui, combien, quand, comment.",
  "source": "Rapport d'impact public.",
  "analyse": { "par": "compétence prisme-rapport (Claude Code)", "date": "AAAA-MM-JJ", "modele": "PRISME 2.0" },
  "revendications": [ { "id": "R1", "enonce": "…", "court": "…", "citation": "…", "pages": "p. 37", "domaine": "D01",
      "propriete": "…", "portee": "…", "preuves": [ { "texte": "…", "pages": "p. 37" } ],
      "conception_invoquee": { "id": "I", "mode": "reconstruite", "premisse": "…" },
      "lectures": { "M": { … }, "I": { … }, "S": { … }, "V": { "statut_croisement": "…", "options": [ … ] }, "N": { "statut_croisement": "…", "options": [ … ] } } } ]
}
```

Puis lance `node tools/build-data.js` et `node tools/verify-data.js` ; corrige jusqu'à ce que le contrôle passe. Vérifie l'affichage (`./serve.sh`, page `#/rapports`). Propose ensuite à l'utilisatrice de valider avant de committer et de pousser.

## 5. Réévaluer sous un principe ou une obligation saisis

Demande type : « PRISME : réévalue la revendication R3 du rapport « resante-vous-2024 » sous le principe : « … » ». Formule la garantie de ce principe (ou de cette obligation) pour le cas, rends le verdict avec les preuves du rapport, et ajoute l'option à `lectures.N.options` (ou `lectures.V.options`) avec `source` : « saisi par l'utilisatrice ». Reconstruis, contrôle, affiche.

## Écriture

Français clair et exact, sans jargon emprunté. Phrases courtes dans les champs ; aucune explication dans l'interface au-delà des champs. Ne jamais inventer un chiffre, une page ou une citation : ce qui manque au rapport va dans `manque`.
