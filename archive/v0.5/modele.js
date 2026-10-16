/*
 * Modèle conceptuel, hors exemple.
 * Contenu scientifique uniquement : aucun code d'affichage.
 *
 * Origine des textes :
 *  - `source: "autrice"` : formulation fournie par l'autrice (consigne du 9 octobre 2026).
 *  - `source: "proposition"` : formulation rédigée pour l'application, à relire et valider.
 */
(function () {
  var P = (window.PRISME = window.PRISME || {});
  P.data = P.data || {};

  P.data.model = {
    title: "Modèle conceptuel",
    lead: {
      source: "proposition",
      text: "Une conception de la valeur oriente la spécification d'un critère. La référence retenue s'argumente dans la situation.",
    },

    frames: {
      domain: { label: "Domaine de critères", note: "Famille de caractéristiques à apprécier, par exemple la pertinence ou la portée et l'accès." },
      situation: { label: "Situation", note: "Besoin, principe, destinataires et relations instrumentales propres au cas." },
    },

    /* Stations du faisceau, dans l'ordre du trajet. */
    stations: {
      property: { label: "Propriété à apprécier", caption: "faisceau entrant" },
      conception: { label: "Conception de la valeur", caption: "oriente ce que l'on tient pour valable" },
      compatible: { label: "Références compatibles", caption: "plusieurs, sous une même conception" },
      precision: { label: "Précision dans la situation", caption: "interprétation argumentée, à justifier" },
      retained: { label: "Référence de valeur retenue" },
      criterion: { label: "Critère spécifié" },
    },

    /* Les trois dimensions du critère (formulations de l'autrice). */
    dimensions: {
      content: { label: "Contenu", question: "Quelle propriété est formulée comme désirable ?" },
      reference: { label: "Référence de valeur", question: "Au regard de quel bénéfice ou de quel principe cette propriété compte-t-elle ?", tag: "précisée en amont" },
      function: { label: "Fonction", question: "Quelle relation justifie cette propriété au regard de cette référence ?" },
    },

    /* Apport de l'article. */
    propositions: {
      P1: {
        source: "autrice",
        text: "Une conception de la valeur oriente le contenu du critère par une référence précisée dans la situation. Des conceptions différentes peuvent justifier un même contenu.",
      },
      P2: {
        source: "autrice",
        text: "À contenu, standard et observations identiques, des justifications différentes peuvent autoriser des conclusions de portée différente.",
      },
    },

    /*
     * Relations cliquables sur le trajet. Chaque explication distingue ce qui est
     * mobilisé, ce qui doit être justifié et ce qu'on peut en déduire.
     * Rédaction : proposition, à relire.
     */
    relations: [
      {
        id: "orientation",
        label: "La conception oriente",
        source: "proposition",
        mobilise: "Une conception générale de la valeur : des prémisses sur ce qui vaut, pour qui et pourquoi.",
        justifier: "À ce stade, rien n'est encore choisi. La conception délimite les références que l'on peut tenir pour valables.",
        deduire: "Plusieurs références peuvent être compatibles avec une même conception. Aucune n'en découle automatiquement.",
        detail: "Les cinq conceptions retenues (maximisatrice, individualiste, parties prenantes ciblées, vertueuse, normative) proviennent de la typologie de de la Cruz Jara et Spanjol. Leurs descriptions présentent chaque approche ; elles ne constituent pas des règles de déduction.",
        supports: ["ref-delacruz2025", "ref-manuscrit"],
        examples: [{ cmpId: "cmp-fonctions", label: "Une même conception, une autre référence que dans l'exemple principal" }],
      },
      {
        id: "precision",
        label: "Précision dans la situation",
        source: "proposition",
        mobilise: "La situation : le besoin, le principe, les destinataires et les relations instrumentales en jeu.",
        justifier: "Pourquoi ce bénéfice ou ce principe précis, plutôt qu'une autre référence compatible avec la même conception.",
        deduire: "La référence de valeur retenue. Elle résulte d'une interprétation argumentée de la situation.",
        detail: "La conception ne fixe ni le besoin, ni le principe, ni les destinataires. Ces éléments doivent être précisés pour que la référence soit assez déterminée pour apprécier une propriété.",
        supports: ["ref-manuscrit"],
        examples: [{ cmpId: "cmp-pertinence", label: "La situation modifie ce que la référence fait retenir" }],
      },
      {
        id: "P1",
        label: "P1",
        source: "autrice",
        mobilise: "La référence de valeur retenue et la propriété à apprécier.",
        justifier: "Que la propriété, formulée comme désirable, compte bien au regard de cette référence.",
        deduire: "Le contenu du critère. Des conceptions différentes peuvent, par des références différentes, justifier un même contenu ; des références différentes peuvent aussi conduire à des contenus différents.",
        detail: "Les domaines de critères proviennent du modèle de Teasdale ; l'organisation du critère en contenu, référence de valeur et fonction appartient au travail analytique de l'article.",
        supports: ["ref-teasdale2021", "ref-teasdale2023", "ref-manuscrit"],
        examples: [
          { cmpId: "cmp-acces", label: "Deux conceptions, un même contenu" },
          { cmpId: "cmp-pertinence", label: "Deux références, deux contenus" },
        ],
      },
      {
        id: "fonction",
        label: "Fonction",
        source: "proposition",
        mobilise: "Le contenu et la référence de valeur retenue.",
        justifier: "La relation entre eux : la propriété constitue un aspect du bénéfice ou une exigence du principe, ou elle contribue à les réaliser.",
        deduire: "Ce que la satisfaction du critère pourra autoriser à conclure. Les deux relations peuvent se cumuler. Une même conception peut soutenir l'une ou l'autre selon la référence et la relation précisées dans la situation.",
        detail: "Le mot « directe » désigne une place dans le raisonnement évaluatif et non un effet causal direct. Une fonction instrumentale peut être essentielle à une valeur prioritaire ; elle ne reçoit aucun poids inférieur.",
        supports: ["ref-manuscrit"],
        examples: [
          { cmpId: "cmp-acces", label: "Instrumentale sous une conception, directe sous l'autre" },
          { cmpId: "cmp-fonctions", label: "Les mêmes conceptions, des fonctions inversées" },
        ],
      },
      {
        id: "P2",
        label: "P2",
        source: "autrice",
        mobilise: "Le standard, les observations et la fonction justifiée.",
        justifier: "Que le standard et les observations couvrent ce que la fonction demande : l'aspect ou l'exigence examinés, ou la contribution de la propriété et la réalisation du bénéfice.",
        deduire: "Une conclusion autorisée, avec son périmètre, et les éléments restant à établir. Une preuve supplémentaire peut l'étendre ou la réviser.",
        detail: "La distinction entre logique générale et logique de travail de Fournier éclaire le passage d'un constat à une conclusion évaluative.",
        supports: ["ref-fournier1995", "ref-manuscrit"],
        examples: [{ cmpId: "cmp-acces", stage2: true, label: "Le même constat, deux conclusions" }],
      },
    ],

    /* Section 4 : fonctions et conclusions autorisées. */
    functions: {
      title: "Deux justifications, deux portées de conclusion",
      inputs: { label: "Standard et observations", text: "Le même standard, les mêmes observations." },
      items: [
        {
          id: "direct",
          simple: "La propriété constitue un aspect du bénéfice ou une exigence du principe retenu.",
          name: "fonction directe",
          note: "« Directe » désigne une place dans le raisonnement, pas un effet causal.",
          allowed: "La satisfaction de l'aspect ou de l'exigence examinés.",
          condition: "Si le standard et les observations les couvrent effectivement.",
          remaining: "Les autres aspects ou exigences, et le jugement global.",
          source: "autrice",
          sourceNote: "« Conclusion autorisée » et « condition » : formulations de l'autrice ; « éléments restant à établir » : proposition.",
        },
        {
          id: "instrumental",
          simple: "La propriété contribue à réaliser ce bénéfice ou cette exigence.",
          name: "fonction instrumentale",
          note: "Elle peut être essentielle à une valeur prioritaire.",
          allowed: "La satisfaction du standard par la propriété.",
          condition: null,
          remaining: "Pour conclure sur le bénéfice : des éléments qui étayent la contribution de la propriété à sa réalisation, ou qui établissent cette réalisation.",
          source: "autrice",
          sourceNote: "« Éléments restant à établir » : formulation de l'autrice ; « conclusion autorisée » : proposition.",
        },
      ],
      notes: [
        "Les deux fonctions peuvent se cumuler ; chaque justification garde sa propre chaîne.",
        "Une même conception de la valeur peut soutenir l'une ou l'autre, selon la référence et la relation précisées dans la situation.",
        "Une preuve supplémentaire peut étendre ou réviser une conclusion.",
        "Chaque conclusion conserve son périmètre ; le jugement global demande encore une synthèse.",
      ],
    },
  };
})();
