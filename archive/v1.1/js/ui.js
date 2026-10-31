/*
 * Composants partagés : panneau latéral, liens bibliographiques,
 * volet « Sources et construction du modèle ».
 * Le panneau se superpose à la page : l'ouvrir ne modifie ni le dossier ni les choix courants.
 */
(function () {
  var P = window.PRISME;
  var C = P.C, M = P.M, S = P.S;
  var h = P.h;
  var U = (P.comp = {});

  var lastFocus = null;
  U.openDrawer = function (content, label) {
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

  /* Volet « Sources et construction du modèle ». */
  U.openSources = function () {
    var D = C.documentation;
    var rep = D.repertoire;
    U.openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: "Documentation" }),
      h("h2", { id: "drawer-title", text: D.titre }),
      h("p", { class: "lead", text: C.accueil.enonce_modele }),
      U.section("Attributions", h("ul", { class: "plain" }, D.attributions.map(function (t) { return h("li", { text: t }); }))),
      U.section("Questions d'analyse", h("ul", { class: "plain" }, D.questions_analyse.map(function (t) { return h("li", { text: t }); }))),
      U.section("Propositions", D.propositions.map(function (t) { return U.p(t); })),
      U.section("Les quatre fonctions", h("dl", { class: "fn-def" }, M.rubriques.map(function (r, i) {
        var f = C.fonctions[i];
        return [h("dt", { style: "--dim:" + P.colors[f.id].ray }, f.terme + " · " + r.fonction),
          h("dd", null, U.p(r.contenu), U.p(r.absence, "muted small"),
            h("p", { class: "muted small" }, "Appuis : ", S.appuis_par_fonction[f.id].map(function (id) { return P.refLabel(P.ref(id)); }).join(" ; ")))];
      })), "small-gap"),
      U.p(M.justification_regroupement, "muted small"),
      U.section("Statut", [U.p(D.note_statut), U.p(M.ce_qui_reste_a_eprouver, "muted small")]),
      U.section("Références", [U.refList(S.references.map(function (r) { return r.id; }), true), U.p(S.precision, "muted small")]),
      h("details", { class: "more" }, h("summary", { text: "Traçabilité" }),
        U.p("Répertoire de " + rep.nombre_cellules + " croisements entre conceptions et fonctions : " + rep.specifications_proposees + " formulations proposées, " + rep.propositions_exploratoires + " exploratoires et " + rep.relations_ouvertes.length + " relations ouvertes (" + rep.relations_ouvertes.join(", ") + "). " + rep.fonction),
        U.p("Le répertoire n'est pas publié sur ce site ; ses statuts sont conservés dans le fichier de référence.", "muted small"),
        U.p("Modèle de référence : " + M.version + ". " + M.statut, "muted small"))));
  };
})();
