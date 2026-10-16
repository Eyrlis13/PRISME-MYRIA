/*
 * Configurations de critères. Une configuration = un prisme.
 *
 * Valeur `null` = non renseigné. Un champ non renseigné reste affiché
 * comme tel ; l'application ne le complète jamais.
 *
 * `origin` : "litterature" | "deduction" | "hypothese".
 * La classification des origines est une proposition éditoriale à valider.
 * `supports` : liste d'appuis documentaires du modèle {ref, note}.
 */
(function () {
  var P = (window.PRISME = window.PRISME || {});
  P.data = P.data || {};

  var MANUSCRIT = { ref: "ref-manuscrit", note: "Sections 4.1 à 4.3 : formulation et comparaison." };
  var TEASDALE = { ref: "ref-teasdale2021", note: "Domaine Portée et accès." };
  var TEASDALE_PERT = { ref: "ref-teasdale2021", note: "Domaine Pertinence." };
  var CONCEPTION = function (what) {
    return { ref: "ref-delacruz2025", note: "Conception " + what + " : définition." };
  };

  P.data.configurations = [
    /* ---------- Exemple 1 : accès à un accompagnement administratif ---------- */
    {
      id: "cfg-acces-A",
      tag: "Configuration A",
      domainId: "portee-acces",
      conceptionId: "parties-prenantes-ciblees",
      contextId: "ctx-acces",
      recipients: "Un groupe délimité de personnes rencontrant des difficultés administratives.",
      content: {
        short: "Possibilité effective d'accès, pour chaque personne du groupe.",
        full: "Possibilité effective, pour chaque personne du groupe, d'accéder à l'accompagnement administratif.",
        explanation:
          "La propriété appréciée est l'accès, délimité à un groupe et à un accompagnement précis.",
        origin: "hypothese",
        supports: [TEASDALE, MANUSCRIT],
        conditions: [
          "Le groupe, l'accompagnement et la période considérée doivent être délimités.",
        ],
      },
      justificationIds: ["jus-acces-A"],
      assessment: {
        mode: "conclusion",
        observed: "Supposons que des observations fiables établissent la satisfaction de ce standard.",
        standard: "Chaque personne du groupe dispose de cette possibilité pendant la période considérée.",
        supported: "La possibilité d'accès satisfait le standard retenu.",
        remaining:
          "La réalisation du bénéfice administratif : les éléments disponibles doivent encore soutenir la conclusion selon laquelle une réponse effective aux difficultés a été obtenue.",
        conditions: ["La contribution de l'accès au bénéfice invoqué doit être étayée."],
        supports: [{ ref: "ref-fournier1995", note: "Passage d'un constat à une conclusion évaluative." }],
      },
      sources: { criterion: null, data: null },
      completeness: {
        status: "complète",
        note: "Complète pour l'exemple construit.",
        missing: ["sources.criterion", "sources.data"],
      },
    },
    {
      id: "cfg-acces-B",
      tag: "Configuration B",
      domainId: "portee-acces",
      conceptionId: "normative",
      contextId: "ctx-acces",
      recipients: "Un groupe délimité de personnes rencontrant des difficultés administratives.",
      content: {
        short: "Possibilité effective d'accès, pour chaque personne du groupe.",
        full: "Possibilité effective, pour chaque personne du groupe, d'accéder à l'accompagnement administratif.",
        explanation:
          "La propriété appréciée est l'accès, délimité à un groupe et à un accompagnement précis.",
        origin: "hypothese",
        supports: [TEASDALE, MANUSCRIT],
        conditions: [
          "Le groupe, l'accompagnement et la période considérée doivent être délimités.",
        ],
      },
      justificationIds: ["jus-acces-B"],
      assessment: {
        mode: "conclusion",
        observed: "Supposons que des observations fiables établissent la satisfaction de ce standard.",
        standard: "Chaque personne du groupe dispose de cette possibilité pendant la période considérée.",
        supported: "Le constat peut établir la satisfaction de cette exigence particulière.",
        remaining:
          "Le respect d'autres exigences et la valeur globale de l'intervention demandent d'autres éléments.",
        conditions: ["Le standard et les observations doivent couvrir les termes de l'exigence."],
        supports: [{ ref: "ref-fournier1995", note: "Passage d'un constat à une conclusion évaluative." }],
      },
      sources: { criterion: null, data: null },
      completeness: {
        status: "complète",
        note: "Complète pour l'exemple construit.",
        missing: ["sources.criterion", "sources.data"],
      },
    },

    /* ---------- Exemple 2 : variation du contenu dans la pertinence ---------- */
    {
      id: "cfg-pert-indiv",
      tag: "Configuration A",
      domainId: "pertinence",
      conceptionId: "individualiste",
      contextId: "ctx-ateliers",
      recipients: "Des adultes rencontrant des difficultés administratives.",
      content: {
        short: "Adéquation aux usages valorisés par la personne.",
        full: "Adéquation des ateliers aux usages valorisés par la personne.",
        explanation:
          "La propriété appréciée est l'adéquation des ateliers, délimitée par les usages que chaque personne valorise.",
        origin: "deduction",
        supports: [TEASDALE_PERT, MANUSCRIT],
        conditions: ["Les usages valorisés par chaque personne doivent pouvoir être identifiés."],
      },
      justificationIds: ["jus-pert-indiv"],
      assessment: {
        mode: "formulation",
        observed: null,
        standard: null,
        supported: null,
        remaining: null,
        conditions: [],
        supports: [],
      },
      sources: { criterion: null, data: null },
      completeness: {
        status: "partielle",
        note: "Exemple centré sur la relation entre référence et contenu.",
        missing: ["function", "assessment.standard", "assessment.observed", "sources.criterion", "sources.data"],
      },
    },
    {
      id: "cfg-pert-ciblees",
      tag: "Configuration B",
      domainId: "pertinence",
      conceptionId: "parties-prenantes-ciblees",
      contextId: "ctx-ateliers",
      recipients: "Des adultes rencontrant des difficultés administratives.",
      content: {
        short: "Adéquation aux difficultés administratives communes au groupe.",
        full: "Adéquation des ateliers aux difficultés administratives communes au groupe.",
        explanation:
          "La propriété appréciée est l'adéquation des ateliers, délimitée par le besoin administratif commun du groupe.",
        origin: "deduction",
        supports: [TEASDALE_PERT, MANUSCRIT],
        conditions: ["Le besoin administratif commun au groupe doit pouvoir être identifié."],
      },
      justificationIds: ["jus-pert-ciblees"],
      assessment: {
        mode: "formulation",
        observed: null,
        standard: null,
        supported: null,
        remaining: null,
        conditions: [],
        supports: [],
      },
      sources: { criterion: null, data: null },
      completeness: {
        status: "partielle",
        note: "Exemple centré sur la relation entre référence et contenu.",
        missing: ["function", "assessment.standard", "assessment.observed", "sources.criterion", "sources.data"],
      },
    },

    /* ---------- Contre-exemples : une conception, plusieurs fonctions ---------- */
    {
      id: "cfg-ce-ciblees",
      tag: "Contre-exemple 1",
      domainId: "portee-acces",
      conceptionId: "parties-prenantes-ciblees",
      contextId: "ctx-ce-besoin",
      recipients: "Un groupe délimité, exclu d'une activité collective.",
      content: {
        short: "Possibilité effective d'accès à l'activité collective.",
        full: "Possibilité effective, pour chaque personne du groupe, d'accéder à l'activité collective.",
        explanation: "La propriété appréciée est l'accès à l'activité dont le groupe est exclu.",
        origin: "hypothese",
        supports: [TEASDALE, MANUSCRIT],
        conditions: [],
      },
      justificationIds: ["jus-ce-ciblees"],
      assessment: {
        mode: "conclusion",
        observed: null,
        standard: null,
        supported:
          "Sous cette conception et pour ce besoin, la fonction de l'accès peut être directe : la propriété exprime un aspect de la réponse au besoin.",
        remaining:
          "Pour un autre besoin du même groupe, la fonction de l'accès demande d'être réexaminée.",
        conditions: ["Le besoin du groupe doit effectivement concerner l'exclusion de cette activité."],
        supports: [],
      },
      sources: { criterion: null, data: null },
      completeness: {
        status: "partielle",
        note: "Contre-exemple centré sur la fonction. Aucun standard ni constat.",
        missing: ["assessment.standard", "assessment.observed", "sources.criterion", "sources.data"],
      },
    },
    {
      id: "cfg-ce-normative",
      tag: "Contre-exemple 2",
      domainId: "portee-acces",
      conceptionId: "normative",
      contextId: "ctx-ce-protection",
      recipients: "Un groupe délimité de personnes pour lesquelles le principe exige une protection.",
      content: {
        short: "Possibilité effective d'accès à l'accompagnement.",
        full: "Possibilité effective, pour chaque personne du groupe, d'accéder à l'accompagnement.",
        explanation: "La propriété appréciée est l'accès à l'accompagnement qui aide à obtenir la protection.",
        origin: "hypothese",
        supports: [TEASDALE, MANUSCRIT],
        conditions: [],
      },
      justificationIds: ["jus-ce-normative"],
      assessment: {
        mode: "conclusion",
        observed: null,
        standard: null,
        supported:
          "Sous cette conception et pour ce principe, la fonction de l'accès peut être instrumentale relativement à l'exigence de protection.",
        remaining:
          "La satisfaction de l'exigence de protection demande d'autres éléments que l'accès à l'accompagnement.",
        conditions: ["La contribution de l'accompagnement à l'obtention de la protection doit être étayée."],
        supports: [],
      },
      sources: { criterion: null, data: null },
      completeness: {
        status: "partielle",
        note: "Contre-exemple centré sur la fonction. Aucun standard ni constat.",
        missing: ["assessment.standard", "assessment.observed", "sources.criterion", "sources.data"],
      },
    },
  ];

  /* ---------- Justifications : référence de valeur + fonction ---------- */
  P.data.justifications = [
    {
      id: "jus-acces-A",
      configId: "cfg-acces-A",
      valueReference: {
        short: "Réponse effective aux difficultés administratives communes.",
        full: "Une réponse effective aux difficultés administratives communes au groupe.",
        explanation:
          "Sous cette conception, le bénéfice est une réponse au besoin commun du groupe.",
        origin: "deduction",
        supports: [CONCEPTION("des parties prenantes ciblées"), MANUSCRIT],
        conditions: ["Le besoin administratif commun au groupe doit être précisé."],
      },
      function: {
        type: "instrumental",
        short: "Instrumentale : l'accès contribue à l'obtention d'une aide.",
        full: "Instrumentale : l'accès compte pour sa contribution à l'obtention d'une aide répondant à ces difficultés.",
        origin: "deduction",
        supports: [MANUSCRIT],
        conditions: ["La contribution de l'accès au bénéfice invoqué doit être étayée."],
      },
      explanation:
        "L'accès intervient comme moyen d'obtenir la réponse au besoin. Cette fonction n'attribue à l'accès aucun poids inférieur : elle indique la place de l'accès dans le raisonnement.",
      conditions: ["La contribution de l'accès au bénéfice invoqué doit être étayée."],
      supports: [MANUSCRIT],
    },
    {
      id: "jus-acces-B",
      configId: "cfg-acces-B",
      valueReference: {
        short: "Principe exigeant l'accès effectif pour chaque personne.",
        full: "Le principe retenu exige une possibilité effective d'accès à l'accompagnement pour chaque personne du groupe.",
        explanation:
          "Sous cette conception, la valeur est un principe qui guide et juge les conduites.",
        origin: "hypothese",
        supports: [CONCEPTION("normative"), MANUSCRIT],
        conditions: ["Le principe retenu et ses termes doivent être explicités."],
      },
      function: {
        type: "direct",
        short: "Directe : l'accès constitue l'exigence à satisfaire.",
        full: "Directe : cette possibilité d'accès constitue précisément l'exigence à satisfaire.",
        origin: "deduction",
        supports: [MANUSCRIT],
        conditions: ["Le standard et les observations doivent couvrir les termes de l'exigence."],
      },
      explanation:
        "La propriété apparaît dans le critère comme l'accomplissement même d'une exigence du principe. Le mot directe désigne cette place dans le raisonnement.",
      conditions: ["Le standard et les observations doivent couvrir les termes de l'exigence."],
      supports: [MANUSCRIT],
    },
    {
      id: "jus-pert-indiv",
      configId: "cfg-pert-indiv",
      valueReference: {
        short: "Usages que la personne juge bénéfiques dans sa situation.",
        full: "Les usages que la personne considère comme bénéfiques dans sa situation.",
        explanation:
          "Sous cette conception, le bénéfice est apprécié par la personne relativement à son fonctionnement dans son système social.",
        origin: "deduction",
        supports: [CONCEPTION("individualiste"), MANUSCRIT],
        conditions: [],
      },
      function: null,
      explanation: null,
      conditions: [],
      supports: [],
    },
    {
      id: "jus-pert-ciblees",
      configId: "cfg-pert-ciblees",
      valueReference: {
        short: "Besoin administratif commun qui justifie le ciblage.",
        full: "Le besoin administratif commun qui justifie le ciblage du groupe.",
        explanation:
          "Sous cette conception, le bénéfice est anticipé comme réponse à un besoin commun du groupe.",
        origin: "deduction",
        supports: [CONCEPTION("des parties prenantes ciblées"), MANUSCRIT],
        conditions: [],
      },
      function: null,
      explanation: null,
      conditions: [],
      supports: [],
    },
    {
      id: "jus-ce-ciblees",
      configId: "cfg-ce-ciblees",
      valueReference: {
        short: "Réponse au besoin d'exclusion d'une activité collective.",
        full: "Une réponse au besoin commun du groupe, qui concerne son exclusion d'une activité collective.",
        explanation:
          "Sous cette conception, le bénéfice est la réponse à un besoin commun. Ici, le besoin porte sur l'exclusion.",
        origin: "hypothese",
        supports: [CONCEPTION("des parties prenantes ciblées"), MANUSCRIT],
        conditions: [],
      },
      function: {
        type: "direct",
        short: "Directe : l'accès est un aspect de la réponse au besoin.",
        full: "Directe : accéder à cette activité constitue un aspect de la réponse au besoin.",
        origin: "deduction",
        supports: [MANUSCRIT],
        conditions: ["Le besoin du groupe doit effectivement concerner l'exclusion de cette activité."],
      },
      explanation:
        "Le besoin porte sur l'exclusion de l'activité. Accéder à cette activité exprime donc une partie de la réponse attendue.",
      conditions: ["Le besoin du groupe doit effectivement concerner l'exclusion de cette activité."],
      supports: [MANUSCRIT],
    },
    {
      id: "jus-ce-normative",
      configId: "cfg-ce-normative",
      valueReference: {
        short: "Principe exigeant une protection pour les personnes.",
        full: "Le principe retenu exige une protection pour les personnes du groupe.",
        explanation:
          "Sous cette conception, la valeur est un principe qui guide et juge les conduites. Ici, le principe porte sur une protection.",
        origin: "hypothese",
        supports: [CONCEPTION("normative"), MANUSCRIT],
        conditions: [],
      },
      function: {
        type: "instrumental",
        short: "Instrumentale : l'accès aide à obtenir la protection.",
        full: "Instrumentale : l'accès à l'accompagnement compte pour sa contribution à l'obtention de cette protection.",
        origin: "deduction",
        supports: [MANUSCRIT],
        conditions: ["La contribution de l'accompagnement à l'obtention de la protection doit être étayée."],
      },
      explanation:
        "L'exigence porte sur la protection. L'accès à l'accompagnement compte parce que l'accompagnement aide à l'obtenir.",
      conditions: ["La contribution de l'accompagnement à l'obtention de la protection doit être étayée."],
      supports: [MANUSCRIT],
    },
  ];
})();
