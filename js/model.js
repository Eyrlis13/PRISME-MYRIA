/*
 * Page « Modèle conceptuel » : fonctionnement générique, sans cas ni verdict.
 * Lecture évaluative → prisme de la conception → quatre dimensions des exigences ;
 * dossier évaluatif commun (entrée distincte) → confrontation → jugement justifié.
 */
(function () {
  var P = window.PRISME;
  var D = P.D;
  var h = P.h;
  var U = P.comp;
  var T = P.ui.model;
  var NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  /* Détail d'une conception, au niveau générique. */
  function openConception(id) {
    var p = P.profile(id);
    var code = P.ui.specCodes[id];
    U.openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: "Conception de la valeur sociale" }),
      h("h2", { id: "drawer-title", text: p.name }),
      h("p", { class: "lead", text: p.question }),
      h("section", { class: "d-sec" }, h("h3", { text: "Prémisse" }), h("p", { text: p.premise })),
      h("section", { class: "d-sec accent" }, h("h3", { text: "Orientation des quatre dimensions" }),
        h("ul", { class: "dim-orient" }, P.dims.map(function (d) {
          var c = P.ui.dimColors[d.id];
          return h("li", { style: "--dim:" + c.ray }, h("span", { class: "lab inline", text: d.label + " · " }), p.generic_dimensions[d.id]);
        }))),
      h("p", { class: "callout-note", text: T.specification }),
      id === "N" ? h("p", { class: "callout-note", text: T.normativeOpen }) : null,
      h("section", { class: "d-sec" }, h("h3", { text: "Proposition examinée par le jugement" }), h("p", { text: p.claim })),
      h("details", { class: "more" }, h("summary", { text: "Détail scientifique" }),
        h("p", { class: "lab", text: "À préciser dans une situation" }), h("p", { text: p.missing }),
        h("p", { class: "lab", text: "Ce que cette conception n'implique pas" }), h("p", { text: p.not_implied }),
        h("p", { class: "lab", text: "Spécification utilisée dans les illustrations (" + code + ")" }), h("p", { text: p.specification }),
        h("p", { class: "lab", text: P.ui.provenance.authors }), U.refList(p.sources),
        h("p", { class: "muted small", text: D.sources.filter(function (s) { return s.id === "DCJ"; })[0].role }))));
  }

  function openRelations() {
    U.openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: "Exigences de justification" }),
      h("h2", { id: "drawer-title", text: "Quatre dimensions interdépendantes" }),
      h("p", { class: "lead", text: D.model.relations }),
      h("ul", { class: "dim-orient" }, P.dims.map(function (d) {
        return h("li", { style: "--dim:" + P.ui.dimColors[d.id].ray }, h("span", { class: "lab inline", text: d.label + " · " }), P.ui.dimRoles[d.id].role);
      })),
      h("p", { text: D.model.generalization }),
      h("details", { class: "more" }, h("summary", { text: "Niveaux de lecture et références" }),
        h("ul", { class: "plain" }, D.model.reading_levels.map(function (r) { return h("li", { text: r }); })),
        h("p", { class: "lab", text: P.ui.provenance.ours }), h("p", { text: D.metadata.content_policy }),
        h("p", { class: "lab", text: P.ui.provenance.authors }), U.refList(D.model.sources))));
  }

  function openBlock(id) {
    var b = P.block(id);
    U.openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: "Modèle conceptuel" }),
      h("h2", { id: "drawer-title", text: b.label }),
      h("p", { class: "lead", text: b.detail }),
      D.model.links.filter(function (l) { return l.from_id === id || l.to_id === id; }).map(function (l) {
        return h("p", null, h("span", { class: "lab inline", text: P.block(l.from_id).label + " → " + P.block(l.to_id).label + " : " }), l.label);
      }),
      id === "dossier" ? h("p", { class: "callout-note", text: T.dossierNote }) : null,
      id === "judgment" ? h("p", { class: "muted", text: T.judgmentNoCase }) : null));
  }

  /*
   * state : { conception: null | "M"|"I"|"G"|"V"|"N" }
   * api : { setConception(id|null), goIllustrations(id|null) }
   */
  P.renderModel = function (state, api) {
    var prof = state.conception ? P.profile(state.conception) : null;
    var scene = h("section", { class: "optic model", id: "model", "aria-label": "Modèle conceptuel" });
    scene.appendChild(svgEl("svg", { class: "rays-overlay", "aria-hidden": "true" }));
    var inner = h("div", { class: "wrap model-inner" });
    scene.appendChild(inner);
    inner.appendChild(h("header", { class: "m-head" },
      h("h2", { text: D.model.title }),
      h("p", { class: "m-lead", text: D.model.lead })));

    var grid = h("div", { class: "m-grid" });

    /* conception : le grand prisme */
    var conc = h("div", { class: "m-conc" });
    var stageCol = h("div", { class: "m-prism-col" });
    stageCol.appendChild(h("div", { class: "m-src" }, h("span", { class: "lamp-glow", "data-anchor": "lamp", "aria-hidden": "true" }),
      h("span", { class: "src-txt" }, h("span", { class: "st-label", text: T.beamLabel }), h("span", { class: "st-cap", text: T.beamCaption }))));
    var dial = P.createDial({
      uid: "m", conceptions: P.conceptions, conceptionId: state.conception, rays: P.dimRays,
      name: "Prisme des conceptions de la valeur sociale",
      onChange: function (id) { api.setConception(id); },
    });
    stageCol.appendChild(dial.el);
    var cBlock = P.block("conception");
    conc.appendChild(h("div", { class: "m-conc-name" },
      h("button", { type: "button", class: "kick-btn", onclick: function () { openBlock("conception"); } }, cBlock.label, h("span", { class: "kick-sub", text: " · " + T.forum })),
      prof
        ? h("button", { type: "button", class: "cn-btn", id: "conception-btn", onclick: function () { openConception(state.conception); } }, h("span", { class: "cn", text: prof.name }), h("span", { class: "chev", "aria-hidden": "true", text: "›" }))
        : h("p", { class: "generic-hint", text: T.genericHint }),
      prof ? h("p", { class: "cn-q", text: prof.question }) : null,
      prof ? h("button", { type: "button", class: "link-light small", id: "generic-btn", onclick: function () { api.setConception(null); } }, "Revenir à la vue générique") : null));
    conc.appendChild(stageCol);
    grid.appendChild(conc);

    /* dossier : entrée distincte */
    var dBlock = P.block("dossier");
    grid.appendChild(h("aside", { class: "m-dossier", "data-anchor": "dossier" },
      h("button", { type: "button", class: "dossier-card", onclick: function () { openBlock("dossier"); } },
        h("span", { class: "dos-k", text: dBlock.label }),
        h("ul", { class: "dos-items" }, T.dossierItems.map(function (t) { return h("li", { text: t }); })),
        h("span", { class: "dos-note", text: dBlock.detail }),
        h("span", { class: "chev", "aria-hidden": "true", text: "›" }))));

    /* quatre dimensions */
    var rBlock = P.block("requirements");
    var req = h("div", { class: "m-req frame" });
    req.appendChild(h("div", { class: "req-head" },
      h("p", { class: "req-k", text: rBlock.label }),
      h("p", { class: "req-link", text: "la conception " + P.link("conception", "requirements").label }),
      h("button", { type: "button", class: "link-light small", id: "relations-btn", onclick: openRelations }, T.dimsLink + " ›")));
    var cards = h("div", { class: "req-cards" });
    P.dims.forEach(function (d) {
      cards.appendChild(U.dimCard(d, {
        text: prof ? prof.generic_dimensions[d.id] : null,
        onclick: function () { U.openDimension(d.id, { profileId: state.conception }); },
      }));
    });
    req.appendChild(cards);
    grid.appendChild(req);

    /* confrontation */
    var cf = P.block("confrontation");
    grid.appendChild(h("button", { type: "button", class: "m-confront", "data-anchor": "confront", onclick: function () { openBlock("confrontation"); } },
      h("span", { class: "mc-links" }, "les exigences " + P.link("requirements", "confrontation").label + " · le dossier " + P.link("dossier", "confrontation").label),
      h("span", { class: "mc-k", text: cf.label }),
      h("span", { class: "mc-d", text: cf.detail })));

    /* jugement */
    var jd = P.block("judgment");
    grid.appendChild(h("div", { class: "m-judge", "data-anchor": "judge" },
      h("span", { class: "mc-links", text: "la confrontation " + P.link("confrontation", "judgment").label }),
      h("button", { type: "button", class: "judge-btn", onclick: function () { openBlock("judgment"); } },
        h("span", { class: "mc-k", text: jd.label }),
        h("span", { class: "mc-d", text: "Appréciation · portée autorisée · réserves" })),
      prof
        ? h("p", { class: "judge-claim" }, h("span", { class: "lab inline", text: "Proposition examinée sous cette conception : " }), prof.claim)
        : h("p", { class: "judge-claim muted", text: T.judgmentNoCase })));

    inner.appendChild(grid);
    inner.appendChild(h("div", { class: "m-cta" },
      h("button", { type: "button", class: "btn cta", id: "to-illustrations", onclick: function () { api.goIllustrations(state.conception); } },
        prof ? "Voir la conception " + prof.name.toLowerCase() + " appliquée à un dossier" : "Voir le fonctionnement sur des dossiers construits"),
      h("button", { type: "button", class: "link-light small", id: "notes-btn", onclick: U.openNotes }, "Statut et références")));
    scene._dial = dial;
    return scene;
  };

  /* ---------- faisceaux, calculés d'après la mise en page ---------- */
  P.drawModelRays = function (scene) {
    if (!scene || !scene.isConnected) return;
    var svg = scene.querySelector(".rays-overlay");
    var box = scene.getBoundingClientRect();
    svg.setAttribute("width", box.width); svg.setAttribute("height", box.height);
    svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    function rel(p) { return { x: p.x - box.left, y: p.y - box.top }; }
    function rect(el) { var r = el.getBoundingClientRect(); return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top, cx: (r.left + r.right) / 2 - box.left, cy: (r.top + r.bottom) / 2 - box.top, w: r.width }; }
    function path(d, cls, color) { var e = svgEl("path", { d: d, class: cls }); if (color) e.setAttribute("stroke", color); svg.appendChild(e); return e; }
    function curveV(a, b) { var my = (a.y + b.y) / 2; return "M" + a.x + " " + a.y + " C " + a.x + " " + my + ", " + b.x + " " + my + ", " + b.x + " " + b.y; }

    var dial = scene._dial;
    var lamp = rect(scene.querySelector('[data-anchor="lamp"]'));
    var en = rel(dial.entry()), ex = rel(dial.exit());
    var d0 = curveV({ x: lamp.cx, y: lamp.b - 4 }, en);
    path(d0, "beam-glow"); path(d0, "beam-core");

    var cards = [].slice.call(scene.querySelectorAll(".req-cards .dim-card")).map(rect);
    var conf = rect(scene.querySelector('[data-anchor="confront"]'));
    var stacked = cards.length > 1 && cards[1].t > cards[0].b - 2;
    var n = cards.length;
    cards.forEach(function (c, j) {
      var color = P.dimRays[j];
      var spread = (j - (n - 1) / 2) * 4;
      var a, b, d;
      if (!stacked) {
        /* exigences : du prisme au haut de chaque carte, puis de la carte vers la confrontation */
        a = { x: ex.x + spread, y: ex.y }; b = { x: c.cx, y: c.t + 1 };
        d = curveV(a, b);
        path(d, "ray-glow", color); path(d, "ray-core", color);
        var tx = conf.l + conf.w * (j + 1) / (n + 1);
        var d2 = curveV({ x: c.cx, y: c.b - 1 }, { x: tx, y: conf.t + 1 });
        path(d2, "ray-glow", color); path(d2, "ray-core thin", color);
      } else {
        /* téléphone : un couloir à gauche des cartes, jusqu'à la confrontation */
        var lane = c.l - 10 - (n - 1 - j) * 6;
        var ty = c.t + 22;
        var reqTop = rect(scene.querySelector(".m-req")).t;
        var y1 = Math.max(ex.y + 10, reqTop - 22 - (n - 1 - j) * 6);
        d = "M" + (ex.x + spread) + " " + ex.y + " L " + (ex.x + spread) + " " + y1 +
          " Q " + (ex.x + spread) + " " + (y1 + 12) + ", " + (ex.x + spread - 12) + " " + (y1 + 12) +
          " L " + (lane + 12) + " " + (y1 + 12) + " Q " + lane + " " + (y1 + 12) + ", " + lane + " " + (y1 + 24) +
          " L " + lane + " " + (ty - 10) + " Q " + lane + " " + ty + ", " + (lane + 10) + " " + ty + " L " + (c.l + 2) + " " + ty;
        path(d, "ray-glow", color); path(d, "ray-core", color);
        var cy = conf.t + 16 + j * 6;
        var dd = "M" + lane + " " + ty + " L " + lane + " " + (cy - 10) + " Q " + lane + " " + cy + ", " + (lane + 10) + " " + cy + " L " + (conf.l + 2) + " " + cy;
        path(dd, "ray-core thin", color);
      }
    });
    /* dossier : un trait plein, de couleur papier, distinct des faisceaux */
    var dos = rect(scene.querySelector('[data-anchor="dossier"] .dossier-card'));
    var frame = rect(scene.querySelector(".m-req"));
    var gx = frame.r + 16, r = 14;
    var dpath = stacked
      ? "M" + dos.cx + " " + dos.b + " L " + dos.cx + " " + conf.t
      : "M" + dos.cx + " " + dos.b + " L " + dos.cx + " " + (frame.t - 18 - r) + " Q " + dos.cx + " " + (frame.t - 18) + ", " + (dos.cx + r) + " " + (frame.t - 18) +
        " L " + (gx - r) + " " + (frame.t - 18) + " Q " + gx + " " + (frame.t - 18) + ", " + gx + " " + (frame.t - 18 + r) +
        " L " + gx + " " + (conf.cy - r) + " Q " + gx + " " + conf.cy + ", " + (gx - r) + " " + conf.cy + " L " + (conf.r + 2) + " " + conf.cy;
    path(dpath, "dossier-line");
    var jd = rect(scene.querySelector('[data-anchor="judge"] .judge-btn'));
    path("M" + jd.cx + " " + conf.b + " L " + jd.cx + " " + jd.t, "judge-line");
  };
})();
