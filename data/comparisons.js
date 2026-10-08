/*
 * Groupes de comparaison. Ils déclarent ce qui est maintenu constant et
 * ce qui varie : l'interface en tire ses annotations. Une égalité de
 * texte ne suffit pas à établir l'équivalence scientifique de deux critères.
 *
 * `constant` / `varies` / `unspecified` utilisent les clés de
 * PRISME.data.elements.
 */
(function () {
  var P = (window.PRISME = window.PRISME || {});
  P.data = P.data || {};

  P.data.comparisons = [
    {
      id: "cmp-acces",
      kind: "principal",
      title: "Accès à un accompagnement administratif",
      subtitle: "Même contenu, justifications différentes",
      domainId: "portee-acces",
      contextMode: "common",
      contextId: "ctx-acces",
      configIds: ["cfg-acces-A", "cfg-acces-B"],
      constant: ["domaine", "contexte", "contenu", "standard", "constat"],
      varies: ["conception", "reference", "fonction"],
      unspecified: [],
      hint: "Le contenu est identique. Tournez les prismes pour comparer leurs justifications.",
      noticeReading:
        "Les deux conclusions ne forment pas deux verdicts opposés : elles répondent à des questions différentes à partir du même constat.",
      cumul: {
        buttonLabel: "Examiner les deux justifications ensemble",
        statement:
          "L'accès peut être retenu simultanément pour satisfaire une exigence et pour contribuer à un bénéfice.",
        closing:
          "Le constat peut satisfaire l'exigence d'accès tout en laissant le bénéfice administratif à établir.",
        separation:
          "Les deux chaînes de justification restent distinctes : elles ne sont ni moyennées ni additionnées.",
        chains: [
          { configId: "cfg-acces-B", title: "Chaîne 1 : l'exigence du principe" },
          { configId: "cfg-acces-A", title: "Chaîne 2 : le bénéfice administratif" },
        ],
      },
      situations: null,
    },

    {
      id: "cmp-pertinence",
      kind: "principal",
      title: "Ateliers numériques",
      subtitle: "Variation du contenu dans un domaine commun",
      domainId: "pertinence",
      contextMode: "common",
      contextId: "ctx-ateliers",
      configIds: ["cfg-pert-indiv", "cfg-pert-ciblees"],
      constant: ["domaine", "contexte"],
      varies: ["conception", "reference", "contenu"],
      unspecified: ["fonction", "standard", "constat"],
      hint: "Les références de valeur diffèrent. Tournez les prismes pour comparer les contenus qu'elles conduisent à formuler, puis changez de situation.",
      noticeReading:
        "Cet exemple examine la relation entre référence de valeur et contenu. Il ne présente aucun standard ni constat et n'annonce donc aucune satisfaction du critère.",
      cumul: null,
      situationsLabel: "Situation pédagogique",
      situationsWarning:
        "Le passage d'une situation à l'autre modifie le rapport entre usages valorisés et besoin administratif. Les écarts ou les rapprochements observés ne résultent pas de la seule conception.",
      situationsConstant:
        "Maintenus constants : le public, les ateliers, les références de valeur et les formulations de contenu.",
      situations: [
        {
          id: "sit-divergence",
          label: "Les usages valorisés débordent le besoin administratif",
          relation: "divergence",
          relationLabel: "Les contenus peuvent diverger",
          description:
            "Les personnes valorisent des usages du numérique qui dépassent les démarches administratives.",
          relationText:
            "Les deux contenus visent des ensembles d'usages différents : les usages valorisés par la personne incluent des usages non administratifs, que le besoin commun du groupe ne retient pas.",
          byConfig: {
            "cfg-pert-indiv": {
              implication:
                "Le critère porte sur l'ensemble des usages que chaque personne valorise, y compris ceux qui n'ont pas de visée administrative. Ces usages entrent dans le champ de l'appréciation.",
              remaining:
                "Un standard, un indicateur et des observations, ainsi que la fonction de la propriété.",
            },
            "cfg-pert-ciblees": {
              implication:
                "Le critère porte sur les difficultés administratives communes au groupe. Les usages valorisés qui débordent ce besoin n'entrent pas dans le champ de l'appréciation.",
              remaining:
                "Un standard, un indicateur et des observations, ainsi que la fonction de la propriété.",
            },
          },
        },
        {
          id: "sit-convergence",
          label: "Les démarches administratives correspondent précisément aux usages valorisés",
          relation: "convergence",
          relationLabel: "Les contenus peuvent converger",
          description:
            "Dans cette situation, les usages que les personnes valorisent coïncident avec leurs démarches administratives. Cette hypothèse remplace, pour cette situation, la mention d'autres usages valorisés du contexte commun.",
          relationText:
            "Les deux formulations désignent ici les mêmes usages. Les références de valeur restent différentes, et les textes des deux contenus aussi : leur convergence tient à la situation, non à la seule égalité des mots.",
          byConfig: {
            "cfg-pert-indiv": {
              implication:
                "Les usages valorisés se limitent ici aux démarches administratives. Le critère recouvre le même ensemble d'usages que celui formulé sous la conception des parties prenantes ciblées.",
              remaining:
                "Un standard, un indicateur et des observations, ainsi que la fonction de la propriété.",
            },
            "cfg-pert-ciblees": {
              implication:
                "Les difficultés administratives communes recouvrent ici les usages valorisés. Le critère recouvre le même ensemble d'usages que celui formulé sous la conception individualiste.",
              remaining:
                "Un standard, un indicateur et des observations, ainsi que la fonction de la propriété.",
            },
          },
        },
      ],
    },

    {
      id: "cmp-fonctions",
      kind: "contre-exemple",
      title: "Une conception peut soutenir plusieurs fonctions",
      subtitle: "Contre-exemples à l'association automatique entre conception et fonction",
      domainId: "portee-acces",
      contextMode: "per-config",
      contextId: null,
      configIds: ["cfg-ce-ciblees", "cfg-ce-normative"],
      constant: ["domaine"],
      varies: ["contexte", "conception", "contenu", "reference", "fonction"],
      unspecified: ["standard", "constat"],
      contextChangeNotice:
        "Ces deux fiches changent les conditions de l'exemple principal. Ce sont des contre-exemples distincts : leur contexte n'est pas celui de la comparaison d'accès, et ils ne forment pas une comparaison à contexte inchangé.",
      hint: "Les contextes diffèrent de l'exemple principal et entre eux. Tournez les prismes pour lire la fonction de chacun.",
      noticeReading:
        "Une conception ne détermine pas, à elle seule, la fonction d'une propriété. Sous les parties prenantes ciblées, la fonction peut être directe. Sous la conception normative, elle peut être instrumentale.",
      cumul: null,
      situations: null,
    },
  ];
})();
