/*
 * Contextes des exemples. Chaque contexte est construit à des fins de
 * raisonnement. Les champs `sourceCritere` et `sourceDonnees` restent à
 * null (non renseignés) : ils ne se déduisent pas de la conception.
 */
(function () {
  var P = (window.PRISME = window.PRISME || {});
  P.data = P.data || {};

  P.data.contexts = [
    {
      id: "ctx-acces",
      constructed: true,
      title: "Un accompagnement administratif",
      text: "Une organisation propose un accompagnement à un groupe délimité de personnes rencontrant des difficultés administratives. Dans ce même exemple, un principe retenu exige que chaque personne de ce groupe ait une possibilité effective d'accéder à l'accompagnement.",
      recipients: "Un groupe délimité de personnes rencontrant des difficultés administratives.",
      sourceCritere: null,
      sourceDonnees: null,
    },
    {
      id: "ctx-ateliers",
      constructed: true,
      title: "Des ateliers numériques",
      text: "Des ateliers numériques s'adressent à des adultes rencontrant des difficultés administratives. Ces personnes valorisent aussi, de manière variable, d'autres usages du numérique.",
      recipients: "Des adultes rencontrant des difficultés administratives.",
      sourceCritere: null,
      sourceDonnees: null,
    },
    {
      id: "ctx-ce-besoin",
      constructed: true,
      title: "Contre-exemple 1 : un besoin d'exclusion",
      text: "Le besoin commun d'un groupe délimité concerne son exclusion d'une activité collective.",
      recipients: "Un groupe délimité, exclu d'une activité collective.",
      sourceCritere: null,
      sourceDonnees: null,
    },
    {
      id: "ctx-ce-protection",
      constructed: true,
      title: "Contre-exemple 2 : un principe de protection",
      text: "Un principe retenu exige une protection pour les personnes d'un groupe délimité. Un accompagnement aide à obtenir cette protection.",
      recipients: "Un groupe délimité de personnes pour lesquelles le principe exige une protection.",
      sourceCritere: null,
      sourceDonnees: null,
    },
  ];
})();
