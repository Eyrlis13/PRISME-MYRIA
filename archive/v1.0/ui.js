/*
 * Composants partagés par les deux pages : panneau latéral, carte de dimension,
 * explications des dimensions, notes et références.
 */
(function () {
  var P = window.PRISME;
  var D = P.D;
  var h = P.h;
  var U = (P.comp = {});

  /* ---------- panneau latéral ---------- */
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

  function section(title, children, cls) {
    return h("section", { class: "d-sec " + (cls || "") }, h("h3", { text: title }), children);
  }
  function para(t, cls) { return t ? h("p", { class: cls || null, text: t }) : null; }

  /* ---------- références ---------- */
  U.refButton = function (ref) {
    var r = P.parseRef(ref);
    if (!r.source) return h("span", { class: "np", text: ref });
    return h("button", { type: "button", class: "ref-chip", onclick: function () { U.openSource(r.id, r.pages); } },
      P.sourceLabel(r.source) + (r.pages ? ", p. " + r.pages : ""));
  };
  U.refList = function (refs) {
    return h("ul", { class: "ref-list" }, refs.map(function (ref) { return h("li", null, U.refButton(ref)); }));
  };
  U.openSource = function (id, pages) {
    var s = P.source(id);
    U.openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: P.ui.provenance.authors }),
      h("h2", { id: "drawer-title", text: P.sourceLabel(s) }),
      h("p", { class: "lead", text: s.title }),
      s.url ? h("p", null, h("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", text: s.url })) : null,
      pages ? section("Passage cité", para("p. " + pages)) : null,
      section("Ce que la source soutient", para(s.role)),
      section("Limite de lecture", para(s.limit)),
      h("details", { class: "more" }, h("summary", { text: "Passages consultés" }), para(s.passages), para(s.read, "muted small"))));
  };

  /* ---------- carte de dimension (identique sur les deux pages) ---------- */
  U.dimCard = function (dim, opts) {
    opts = opts || {};
    var col = P.ui.dimColors[dim.id];
    return h("button", {
      type: "button", class: "dim-card" + (opts.compact ? " compact" : ""), "data-dim": dim.id,
      style: "--dim:" + col.ray + ";--dim-tint:" + col.tint,
      "aria-label": dim.label + ", " + dim.short + (opts.text ? " : " + opts.text : "") + ". Ouvrir l'explication",
      onclick: opts.onclick,
    },
      h("span", { class: "dk" }, h("span", { class: "dot", "aria-hidden": "true" }), dim.label),
      h("span", { class: "ds", text: dim.short }),
      opts.text ? h("span", { class: "dt", text: opts.text }) : null,
      h("span", { class: "chev", "aria-hidden": "true", text: "›" }));
  };

  /*
   * Explication d'une dimension.
   * ctx : { profileId } sur le modèle ; { profileId, reading, caseId } dans une illustration.
   */
  U.openDimension = function (dimId, ctx) {
    ctx = ctx || {};
    var dim = P.dims.filter(function (d) { return d.id === dimId; })[0];
    var role = P.ui.dimRoles[dimId];
    var col = P.ui.dimColors[dimId];
    var prof = ctx.profileId ? P.profile(ctx.profileId) : null;
    var dr = ctx.reading ? ctx.reading.dimensions[dimId] : null;
    var body = h("div", { class: "drawer-body", style: "--dim:" + col.ray + ";--dim-tint:" + col.tint },
      h("p", { class: "eyebrow", text: "Exigences de justification" }),
      h("h2", { id: "drawer-title" }, h("span", { class: "swatch", "aria-hidden": "true" }), dim.label),
      h("p", { class: "lead", text: dim.short }));
    if (dr) {
      body.appendChild(section("Dans cette lecture" + (prof ? " · " + prof.name : ""), [
        h("p", { class: "dim-quote", text: dr.text }),
        para(dr.detail),
        dimId === "preuve" ? para("Cette carte décrit ce qu'il faut établir. Ce que le dossier permet effectivement d'établir figure dans le détail ci-dessus et dans la justification de la conclusion.", "muted small") : null,
      ], "accent"));
    } else if (prof) {
      body.appendChild(section("Orientation sous la conception " + prof.name.toLowerCase(), [h("p", { class: "dim-quote", text: prof.generic_dimensions[dimId] })], "accent"));
    }
    body.appendChild(section("Définition", para(dim.definition)));
    body.appendChild(section("Rôle dans le raisonnement", para(role.role)));
    body.appendChild(section("Articulation avec les autres dimensions", para(role.articulation)));
    body.appendChild(h("details", { class: "more" }, h("summary", { text: "Détail scientifique" }),
      h("p", { class: "lab", text: P.ui.provenance.ours }),
      para(D.model.relations), para(D.model.generalization), para(P.ui.dimRolesSource, "muted small"),
      h("p", { class: "lab", text: P.ui.provenance.authors }),
      U.refList(D.model.sources)));
    U.openDrawer(body);
  };

  /* ---------- notes et références ---------- */
  U.openNotes = function () {
    U.openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: "Notes" }),
      h("h2", { id: "drawer-title", text: "Statut et références" }),
      para(D.metadata.status, "lead"),
      section(P.ui.provenance.ours, [para(D.metadata.content_policy), para(D.model.generalization)]),
      section(P.ui.provenance.cases, [para("Les quinze cas sont des situations construites pour éprouver le raisonnement. Aucune donnée empirique n'est attribuée aux auteurs cités, et les illustrations ne sont pas des observations.")]),
      section(P.ui.provenance.authors, h("ul", { class: "src-list" }, D.sources.map(function (s) {
        return h("li", null,
          h("button", { type: "button", class: "ref-chip", onclick: function () { U.openSource(s.id, ""); } }, P.sourceLabel(s)),
          h("span", { class: "muted small", text: " " + s.role }));
      }))),
      para("Version " + D.metadata.version + " du " + D.metadata.date + " · registre : " + D.metadata.source_register, "muted small")));
  };
})();
