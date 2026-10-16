/*
 * Catalogue de référence : domaines, conceptions, vocabulaire, références.
 * Contenu scientifique uniquement : aucun code d'affichage dans ce fichier.
 *
 * Toute modification scientifique de ces listes (ajout, retrait ou
 * renommage d'un domaine ou d'une conception) doit être consignée dans
 * `changelog` ci-dessous, avec la date, l'auteur et le motif.
 */
(function () {
  var P = (window.PRISME = window.PRISME || {});
  P.data = P.data || {};

  P.data.changelog = [
    {
      date: "2026-10-08",
      note: "Version initiale : onze domaines (Teasdale, 2021, version retenue par l'article) et cinq conceptions (de la Cruz Jara et Spanjol, 2025).",
    },
  ];

  /* Onze domaines de critères, intitulés de la grille du manuscrit. */
  P.data.domains = [
    { id: "resultats-impacts", rank: 1, label: "Résultats et impacts" },
    { id: "effets-non-recherches", rank: 2, label: "Effets non recherchés" },
    { id: "experience", rank: 3, label: "Expérience" },
    { id: "pertinence", rank: 4, label: "Pertinence" },
    { id: "perennite", rank: 5, label: "Pérennité" },
    { id: "portee-acces", rank: 6, label: "Portée et accès" },
    { id: "equite", rank: 7, label: "Équité" },
    { id: "ressources", rank: 8, label: "Ressources" },
    { id: "conception-mise-en-oeuvre", rank: 9, label: "Conception et mise en œuvre" },
    { id: "alignement-coordination", rank: 10, label: "Alignement et coordination" },
    { id: "transfert-adaptation", rank: 11, label: "Transfert et adaptation" },
  ].map(function (d) {
    d.sourceRef = "ref-teasdale2021";
    return d;
  });

  /* Cinq conceptions de la valeur sociale. Les descriptions présentent
     chaque approche au lecteur ; elles ne servent pas de règles de déduction. */
  P.data.conceptions = [
    {
      id: "maximisatrice",
      label: "Maximisatrice",
      description:
        "Recherche d'un bénéfice pour un système englobant personnes, institutions et environnement.",
    },
    {
      id: "individualiste",
      label: "Individualiste",
      description:
        "Bénéfice apprécié par la personne relativement à son fonctionnement dans son système social.",
    },
    {
      id: "parties-prenantes-ciblees",
      label: "Parties prenantes ciblées",
      description: "Bénéfice anticipé comme réponse à un besoin commun du groupe.",
    },
    {
      id: "vertueuse",
      label: "Vertueuse",
      description: "Bénéfice poursuivi à partir d'une obligation morale.",
    },
    {
      id: "normative",
      label: "Normative",
      description: "Valeur comprise comme principe qui guide et juge les conduites.",
    },
  ].map(function (c) {
    c.sourceRef = "ref-delacruz2025";
    return c;
  });

  /* Vocabulaire des trois faces (constant dans toute l'application). */
  P.data.faces = [
    {
      id: "content",
      label: "Contenu",
      role: "Le contenu indique ce que le critère propose d'apprécier : une propriété formulée comme caractéristique désirable d'un objet délimité.",
    },
    {
      id: "reference",
      label: "Référence de valeur",
      role: "La référence de valeur est le bénéfice ou le principe précis au regard duquel cette propriété est appréciée.",
    },
    {
      id: "function",
      label: "Fonction",
      role: "La fonction indique pourquoi cette propriété compte relativement à cette référence.",
    },
  ];

  P.data.functionTypes = {
    direct: {
      label: "Directe",
      definition:
        "La propriété exprime un aspect du bénéfice apprécié ou l'accomplissement d'une exigence du principe retenu.",
      note: "Directe désigne ici une place dans le raisonnement évaluatif. Ce terme ne désigne pas un effet causal direct.",
    },
    instrumental: {
      label: "Instrumentale",
      definition:
        "La propriété compte pour sa contribution à la réalisation de ce bénéfice ou de cette exigence.",
      note: "Une fonction instrumentale peut être essentielle à une valeur prioritaire. L'application ne lui attribue aucun poids inférieur.",
    },
  };

  P.data.origins = {
    litterature: "Prémisse issue de la littérature",
    deduction: "Déduction de l'article",
    hypothese: "Hypothèse de l'exemple",
  };

  /* Éléments comparés dans les groupes de comparaison. */
  P.data.elements = {
    domaine: "Domaine",
    contexte: "Contexte et destinataires",
    situation: "Situation",
    contenu: "Contenu",
    conception: "Conception",
    reference: "Référence de valeur",
    fonction: "Fonction",
    standard: "Standard",
    constat: "Constat",
  };

  P.data.lexique = [
    {
      term: "Conception de la valeur sociale",
      definition:
        "Ensemble de prémisses sur ce qui vaut, pour qui et pourquoi. Elle ne détermine pas à elle seule une configuration complète : le besoin, le principe, les destinataires et les relations instrumentales doivent être précisés.",
    },
    {
      term: "Domaine de critères",
      definition:
        "Famille de caractéristiques à apprécier. La pertinence constitue un domaine ; un prisme représente une configuration de critère à l'intérieur d'un domaine.",
    },
    {
      term: "Contenu",
      definition:
        "Propriété formulée comme caractéristique désirable d'un objet délimité (par exemple l'adéquation d'un accompagnement aux besoins administratifs d'un groupe).",
    },
    {
      term: "Référence de valeur",
      definition:
        "Bénéfice ou principe précis au regard duquel la propriété est appréciée.",
    },
    {
      term: "Fonction directe",
      definition:
        "La propriété exprime un aspect du bénéfice apprécié ou l'accomplissement d'une exigence du principe retenu. Directe désigne une place dans le raisonnement évaluatif et ne désigne pas un effet causal direct.",
    },
    {
      term: "Fonction instrumentale",
      definition:
        "La propriété compte pour sa contribution à la réalisation du bénéfice ou de l'exigence. Plusieurs justifications peuvent coexister pour une même propriété.",
    },
    {
      term: "Critère spécifié",
      definition: "Contenu et justification de valeur, pris ensemble.",
    },
    {
      term: "Standard",
      definition:
        "Niveau de performance attendu. Il reste distinct de la référence de valeur.",
    },
    {
      term: "Indicateur",
      definition:
        "Information qui renseigne la propriété observée. Il reste distinct de la référence de valeur.",
    },
    {
      term: "Source du critère",
      definition:
        "Personne, groupe, document ou ressource participant à la définition ou à la sélection du critère.",
    },
    {
      term: "Source des données",
      definition: "Origine des observations utilisées pour apprécier le critère.",
    },
    {
      term: "Appui documentaire du modèle",
      definition:
        "Publication ou passage du manuscrit soutenant une prémisse ou une déduction.",
    },
  ];

  /* Références documentaires. */
  P.data.references = [
    {
      id: "ref-teasdale2021",
      short: "Teasdale (2021)",
      full: "Teasdale, R. M. (2021). Evaluative criteria: An integrated model of domains and sources. American Journal of Evaluation, 42(3), 354–376.",
      doi: "10.1177/1098214020955226",
      establishes: "Les onze domaines de critères, dans la version retenue par l'article.",
    },
    {
      id: "ref-teasdale2023",
      short: "Teasdale et al. (2023)",
      full: "Teasdale, R. M., Pitts, R. T., Gates, E. F., et Shim, C. (2023). Teaching specification of evaluative criteria: A guide for evaluation education. New Directions for Evaluation, 2023(177), 31–37.",
      doi: "10.1002/ev.20546",
      establishes: "La spécification des critères évaluatifs.",
    },
    {
      id: "ref-delacruz2025",
      short: "De la Cruz Jara et Spanjol (2025)",
      full: "De la Cruz Jara, M. F., et Spanjol, J. (2025). Understanding multiple perspectives on social value in business: An integrative review and typology. Journal of Business Ethics, 198(2), 407–435.",
      doi: "10.1007/s10551-024-05692-1",
      establishes: "Les cinq conceptions de la valeur sociale.",
    },
    {
      id: "ref-fournier1995",
      short: "Fournier (1995)",
      full: "Fournier, D. M. (1995). Establishing evaluative conclusions: A distinction between general and working logic. New Directions for Evaluation, 1995(68), 15–32.",
      doi: "10.1002/ev.1017",
      establishes: "La logique par laquelle une conclusion évaluative est établie.",
    },
    {
      id: "ref-manuscrit",
      short: "Manuscrit Article 2 (sections 4.1 à 4.3)",
      full: "Manuscrit de travail Article 2 : Des conceptions de la valeur sociale à la spécification des critères de jugement, révision du 8 octobre 2026, sections 4.1 à 4.3.",
      doi: null,
      establishes:
        "L'organisation du prisme en contenu, référence de valeur et fonction, ainsi que les formulations de critères, les situations et les comparaisons des exemples.",
    },
  ];
})();

/* Métaphore optique retenue par l'application (choix de présentation). */
(function () {
  var P = window.PRISME;
  P.data.metaphor = [
    { term: "Lumière blanche (rayon)", definition: "Le domaine de critères, dans la situation considérée : une famille de caractéristiques à apprécier, non encore spécifiée. La situation précise le besoin, le principe et les destinataires que la conception ne fournit pas seule." },
    { term: "Prisme", definition: "La conception de la valeur sociale. Le prisme a cinq faces, une par conception ; la face tournée vers le rayon est celle qui spécifie le critère." },
    { term: "Spectre", definition: "Le critère spécifié, tel qu'il ressort du prisme : trois bandes, contenu, référence de valeur, fonction." },
    { term: "Bande", definition: "Une composante du critère spécifié. Les trois bandes ont une couleur constante qui les distingue ; la couleur n'indique aucune qualité ni préférence." },
    { term: "Écran", definition: "Le panneau où les spectres se projettent et se comparent. Une bande identique sous deux conceptions signale un élément maintenu constant par le groupe de comparaison." },
  ];
})();
