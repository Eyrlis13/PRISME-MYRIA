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
    var A = C.accueil;
    U.openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: "Documentation" }),
      h("h2", { id: "drawer-title", text: "Sources et construction du modèle" }),
      h("p", { class: "lead", text: A.enonce_modele }),
      U.section("Construction", [U.p("PRISME adapte la typologie des cinq conceptions de la valeur sociale de de la Cruz Jara et Spanjol (2025) par le modèle de l’argument de Toulmin (1958) : la conception est le fondement de la garantie qui mène des preuves du dossier à la revendication de valeur."),
        U.p("Les spécifications des 55 croisements (cinq conceptions, onze domaines de critères) reposent sur la définition de chaque conception et sur 44 arguments publiés, vérifiés dans leurs sources. " + M.decompte.proposees + " sont proposées, " + M.decompte.exploratoires + " exploratoires et " + M.decompte.ouvertes + " ouvertes.", "muted small")]),
      U.section("Les quatre composantes", h("dl", { class: "fn-def" }, C.composantes.map(function (f) {
        return [h("dt", { style: "--dim:" + P.colors[f.id].ray }, f.terme), h("dd", null, U.p(f.explication), h("p", { class: "muted small" }, "Appuis : " + M.appuis_composantes[f.id].join(" ; ")))];
      })), "small-gap"),
      U.section("Verdicts", h("dl", { class: "fn-def" }, C.verdicts.map(function (v) { return [h("dt", null, v.nom), h("dd", null, U.p(v.definition))]; }))),
      U.section("Propositions", A.propositions.map(function (p) { return U.p(p.id + " · " + p.texte); })),
      U.section("Intégrité inférentielle", U.p(A.integrite)),
      U.section("Domaines de critères", U.p(C.domaines_source, "muted small")),
      U.section("Références", [h("ul", { class: "ref-list" }, S.references.map(function (r) {
        return h("li", { class: "ref" }, r.url ? h("a", { href: r.url, target: "_blank", rel: "noopener noreferrer", text: r.court }) : h("span", { text: r.court }), h("span", { class: "ref-title", text: " · " + r.apa.replace(/^[^)]*\)\.\s*/, "").replace(/\s*https:\/\/doi\.org\/\S+$/, "") }));
      })), U.p(S.precision, "muted small")])));
  };
})();
