/*
 * Libellés et réglages d'affichage. Aucun contenu scientifique nouveau :
 * le fond vient de data/PRISME_MAJ_2026-10-16.json (window.PRISME_DATA).
 * Les champs marqués « condensation » résument un texte du fichier sans en changer le sens ;
 * ils sont à relire.
 */
(function () {
  var P = (window.PRISME = window.PRISME || {});

  P.ui = {
    subtitle: "Le prisme du jugement",

    /* Couleurs stables des quatre dimensions, sur les deux pages. Elles identifient
       une dimension ; elles ne codent ni réussite ni échec. */
    dimColors: {
      qualification: { ray: "#7aa6e0", tint: "#e9f0fa" },
      portee: { ray: "#f0b54a", tint: "#fcf2df" },
      preuve: { ray: "#6cc192", tint: "#e6f4eb" },
      regle: { ray: "#b49be6", tint: "#f0eafb" },
    },

    /* Rôle et articulation de chaque dimension. Condensation de `model.relations`. */
    dimRoles: {
      qualification: {
        role: "Avec la portée, elle précise ce que la conclusion prétend établir.",
        articulation: "Avec la portée et la règle d'appréciation, elle oriente les exigences de preuve.",
      },
      portee: {
        role: "Avec la qualification, elle précise ce que la conclusion prétend établir.",
        articulation: "Avec la qualification et la règle d'appréciation, elle oriente les exigences de preuve.",
      },
      preuve: {
        role: "Elle indique ce que le dossier doit permettre d'établir pour soutenir l'appréciation envisagée.",
        articulation: "Ses exigences sont orientées par la qualification, la portée et la règle d'appréciation. Le dossier permet ensuite d'examiner les conditions établies, contredites ou indéterminées.",
      },
      regle: {
        role: "Elle précise comment apprécier les éléments pertinents.",
        articulation: "Avec la qualification et la portée, elle oriente les exigences de preuve.",
      },
    },
    dimRolesSource: "Condensation de la relation entre dimensions décrite dans le modèle (champ model.relations).",

    /* Les statuts portent sur la proposition affichée ; ce n'est pas une échelle. */
    statusLabels: {
      etabli: "Proposition établie",
      refute: "Proposition réfutée",
      indetermine: "Proposition indéterminée",
      partiel: "Proposition partiellement établie",
      heterogene: "Proposition hétérogène",
    },

    /* Spécification appliquée dans les illustrations. Condensation de `profiles[x].specification`. */
    specLabels: {
      M: "Effets favorables et défavorables, ressources et horizon explicités",
      I: "Appréciations individuelles restituées, sans moyenne ajoutée",
      G: "Groupe et besoin du dossier commun",
      V: "Bénéfice, engagement et raisons d'agir distingués",
      N: "Principe retenu : consentement",
    },
    specCodes: { M: "M1", I: "I1", G: "G1", V: "V1", N: "N1" },

    /* Cas mis en avant, avec le libellé de la consigne du 16 octobre 2026. */
    quickCases: [
      { id: "C04", label: "Bénéfice ciblé et alternative supérieure" },
      { id: "C06", label: "Bénéfices établis et motivations inconnues" },
      { id: "C15", label: "Bilan favorable et refus initial transgressé" },
      { id: "C01", label: "Convergence avec un dossier complet" },
      { id: "C10", label: "Informations insuffisantes sous les cinq conceptions" },
    ],

    /* Page « Modèle conceptuel ». */
    model: {
      beamLabel: "Lecture évaluative",
      beamCaption: "traverse la conception",
      forum: "explicitée par le forum",
      dimsLink: "Ces dimensions sont interdépendantes",
      genericHint: "Vue générique. Faites tourner le prisme pour explorer les cinq conceptions.",
      specification: "Une même conception peut admettre plusieurs spécifications. Le principe, le périmètre ou la règle effectivement retenus doivent être explicités.",
      normativeOpen: "Sur cette page, le principe reste ouvert : plusieurs principes peuvent être retenus. Les illustrations utilisent la spécification « consentement » (N1).",
      dossierItems: ["Action", "Objectif", "Informations disponibles", "Lacunes"],
      dossierNote: "Le même dossier pour toutes les conceptions : changer de conception ne transforme pas les faits.",
      judgmentNoCase: "Sans dossier particulier, la sortie décrit le jugement et ses conditions.",
    },

    /* Distinction des appuis, exigée pour les références. */
    provenance: {
      authors: "Acquis attribués aux auteurs",
      ours: "Formalisation proposée par notre travail",
      cases: "Hypothèses et déductions des situations construites",
    },
  };
})();
