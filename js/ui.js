/*
 * Composants partagés : panneau latéral, liens bibliographiques,
 * volet « Sources et construction du modèle » (mentions, propositions, issues, lexique, explorateur des 55 cellules).
 * Le panneau se superpose à la page : l'ouvrir ne modifie ni le dossier ni les choix courants.
 */
(function () {
  var P = window.PRISME;
  var C = P.C, S = P.S;
  var h = P.h;
  var U = (P.comp = {});

  var lastFocus = null;
  U.openDrawer = function (content) {
    U.closeDrawer(true);
    lastFocus = document.activeElement;
    var scrim = h("div", { class: "scrim", onclick: function () { U.closeDrawer(); } });
    var dr = h("aside", { class: "drawer", role: "dialog", "aria-modal": "true", "aria-labelledby": "drawer-title", tabindex: "-1" },
      h("button", { type: "button", class: "drawer-close", "aria-label": "Fermer", text: "×", onclick: function () { U.closeDrawer(); } }), content);
    document.body.appendChild(scrim); document.body.appendChild(dr);
    document.body.classList.add("drawer-open");
    dr.focus();
  };
  U.closeDrawer = function (silent) {
    var d = document.querySelector(".drawer"), s = document.querySelector(".scrim");
    if (d) d.remove(); if (s) s.remove();
    document.body.classList.remove("drawer-open");
    if (!silent && lastFocus && lastFocus.focus && document.body.contains(lastFocus)) lastFocus.focus();
  };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.querySelector(".drawer")) U.closeDrawer(); });

  U.section = function (title, children, cls) {
    return h("section", { class: "d-sec " + (cls || "") }, h("h3", { text: title }), children);
  };
  U.p = function (t, cls) { return t ? h("p", { class: cls || null, text: t }) : null; };

  /* Référence : auteurs, année, lien DOI vérifié. */
  U.refItem = function (id, withRole) {
    var r = P.ref(id);
    if (!r) return h("li", { class: "np", text: id });
    return h("li", { class: "ref" },
      h("a", { href: r.url, target: "_blank", rel: "noopener noreferrer" }, P.refLabel(r)),
      h("span", { class: "ref-title", text: " · " + r.titre }),
      withRole ? h("span", { class: "ref-role", text: r.role + " (" + r.passages + ")" }) : null);
  };
  U.refList = function (ids, withRole) {
    return h("ul", { class: "ref-list" }, ids.map(function (id) { return U.refItem(id, withRole); }));
  };

  /* Issues nommées, définition au survol et au clavier (le bouton reçoit le focus). */
  U.issueKeys = function (prefix) {
    return h("ul", { class: "issue-keys" }, C.issues.valeurs.map(function (v) {
      var tid = prefix + "-" + v.id;
      return h("li", { class: "ik" },
        h("button", { type: "button", class: "ik-btn", "aria-describedby": tid }, P.issueChip(v.id)),
        h("span", { class: "ik-tip", role: "tooltip", id: tid, text: v.definition }));
    }));
  };

  /* Statuts des cellules : forme du cadre (plein, tirets, pointillés) et libellé ; distincts des issues. */
  var STATUT = { proposee: "Spécification proposée", exploratoire: "Piste exploratoire", ouverte: "Relation ouverte" };
  U.statutLabel = function (s) { return STATUT[s]; };

  function explorer() {
    var detail = h("div", { class: "cell-detail", "aria-live": "polite" },
      h("p", { class: "muted small", text: "Choisir une cellule pour afficher sa spécification." }));
    var grid = h("table", { class: "cells" },
      h("thead", null, h("tr", null, h("th", { scope: "col", text: "Domaine" }),
        C.conceptions.map(function (c) { return h("th", { scope: "col", title: c.nom, text: c.nom_court }); }))),
      h("tbody", null, C.domaines.map(function (d) {
        return h("tr", null, h("th", { scope: "row", text: d.code + " · " + d.nom }),
          C.conceptions.map(function (c) {
            var cell = C.repertoire.cellules.filter(function (x) { return x.conception === c.id && x.domaine_code === d.code; })[0];
            if (!cell) return h("td");
            return h("td", null, h("button", { type: "button", class: "cell-btn", "data-statut": cell.statut, "data-cell": cell.id,
              "aria-label": cell.id + ", " + c.nom + ", " + d.nom + " : " + STATUT[cell.statut],
              onclick: function (e) {
                grid.querySelectorAll(".cell-btn[aria-pressed=true]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
                e.currentTarget.setAttribute("aria-pressed", "true");
                showCell(cell);
              } }, cell.id));
          }));
      })));
    grid.querySelectorAll(".cell-btn").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    function showCell(cell) {
      detail.textContent = "";
      detail.appendChild(h("div", { class: "cd" },
        h("p", { class: "cd-k" }, cell.id + " · " + P.conception(cell.conception).nom + " · " + cell.domaine),
        h("p", { class: "cd-t", text: cell.formulation_courte }),
        h("p", { class: "cd-s", "data-statut": cell.statut, text: STATUT[cell.statut] }),
        h("dl", { class: "cd-dl" },
          h("dt", { text: "Raison de valoriser" }), h("dd", { text: cell.raison_de_valoriser }),
          h("dt", { text: "Critère" }), h("dd", { text: cell.critere_propose }),
          h("dt", { text: "Question" }), h("dd", { text: cell.question_evaluative }),
          h("dt", { text: "Appuis à examiner" }), h("dd", null, h("ul", { class: "plain" }, cell.appuis_a_examiner.map(function (a) { return h("li", { text: a }); }))),
          h("dt", { text: "Règle pour conclure" }), h("dd", { text: cell.regle_pour_conclure })),
        h("details", { class: "more" }, h("summary", { text: "Limite et lecture concurrente" }), U.p(cell.limite), U.p(cell.interpretation_concurrente))));
    }
    return h("details", { class: "more explorer", id: "explorer" }, h("summary", { text: "Explorer les " + C.repertoire.nombre_cellules + " cellules" }),
      h("ul", { class: "statut-keys" }, Object.keys(STATUT).map(function (s) { return h("li", null, h("span", { class: "sk", "data-statut": s, "aria-hidden": "true" }), STATUT[s]); })),
      h("div", { class: "cells-wrap" }, grid), detail);
  }

  /* Volet « Sources et construction du modèle ». */
  U.openSources = function () {
    var M = C.mentions, R = C.repertoire;
    U.openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: "Documentation" }),
      h("h2", { id: "drawer-title", text: "Sources et construction du modèle" }),
      h("p", { class: "lead", text: C.accueil.enonce_modele }),
      U.section("Provenance", h("ul", { class: "plain" }, [M.typologie, M.domaines, M.modele, M.ia].map(function (t) { return h("li", { text: t }); }))),
      U.section("Propositions", C.propositions.map(function (p) {
        return h("div", { class: "prop" }, h("p", null, h("span", { class: "lab inline", text: p.id + " · " }), p.texte), U.p(p.condition, "muted small"));
      })),
      U.section("Issues d’une affirmation", [U.p(C.issues.definition),
        h("dl", { class: "issue-def" }, C.issues.valeurs.map(function (v) { return [h("dt", null, P.issueChip(v.id)), h("dd", { text: v.definition })]; })),
        U.p(C.issues.regle_de_priorite, "muted small")]),
      U.section("Lexique", h("div", { class: "lex-wrap" }, h("table", { class: "lexique" },
        h("thead", null, h("tr", null, h("th", { scope: "col", text: "Terme" }), h("th", { scope: "col", text: "Définition" }), h("th", { scope: "col", text: "Source" }))),
        h("tbody", null, C.lexique.map(function (l) { return h("tr", null, h("th", { scope: "row", text: l[0] }), h("td", { text: l[1] }), h("td", { class: "muted", text: l[2] })); }))))),
      U.section("Répertoire des cellules", [
        U.p(R.nombre_cellules + " cellules (cinq conceptions × onze domaines) : " + R.specifications_proposees + " spécifications proposées, " + R.pistes_exploratoires + " pistes exploratoires, " + R.relations_ouvertes.length + " relations ouvertes (" + R.relations_ouvertes.join(", ") + ")."),
        U.p(R.note, "muted small"),
        explorer()]),
      U.section("Références", [U.refList(S.references.map(function (r) { return r.id; }), true), U.p(S.precision, "muted small")])));
  };
})();
