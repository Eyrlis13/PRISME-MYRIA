/*
 * Page « Illustrations » : un dossier commun, deux lectures (A et B).
 * Dossier commun → deux conceptions → quatre dimensions par lecture → conclusion,
 * justification, limite. Une rotation ne change que la lecture du côté concerné.
 */
(function () {
  var P = window.PRISME;
  var D = P.D;
  var h = P.h;
  var U = P.comp;
  var NS = "http://www.w3.org/2000/svg";

  function specLabel(id) { return P.ui.specLabels[id]; }

  /* Lecture appliquée : conception, spécification et références. */
  function openReadingSources(c, pid, letter) {
    var r = c.readings[pid], p = P.profile(pid);
    U.openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: "Lecture " + letter + " · " + c.id }),
      h("h2", { id: "drawer-title", text: p.name }),
      h("p", { class: "lead", text: r.conclusion }),
      h("section", { class: "d-sec" }, h("h3", { text: P.ui.provenance.authors }),
        U.refList(r.references),
        h("p", { class: "muted small", text: "Les sources soutiennent la prémisse de la conception. Elles ne sont pas créditées du cas construit." })),
      h("section", { class: "d-sec" }, h("h3", { text: P.ui.provenance.ours }),
        h("p", null, h("span", { class: "lab inline", text: "Prémisse : " }), p.premise),
        h("p", null, h("span", { class: "lab inline", text: "Spécification appliquée (" + P.ui.specCodes[pid] + ") : " }), p.specification),
        h("p", { class: "callout-note", text: P.ui.model.specification })),
      h("section", { class: "d-sec" }, h("h3", { text: P.ui.provenance.cases }),
        h("p", { text: c.kind + "." }),
        c.limits ? h("p", { text: c.limits }) : null,
        h("p", { class: "muted small", text: "Les faits et hypothèses du dossier sont rappelés en haut de la page ; ils sont identiques pour toutes les conceptions." }))));
  }

  function openProfileApplied(pid, letter) {
    var p = P.profile(pid);
    U.openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: "Conception mobilisée · lecture " + letter }),
      h("h2", { id: "drawer-title", text: p.name }),
      h("p", { class: "lead", text: p.question }),
      h("section", { class: "d-sec accent" }, h("h3", { text: "Spécification appliquée dans les illustrations" }),
        h("p", { class: "dim-quote", text: specLabel(pid) }),
        h("p", { text: p.specification }),
        h("p", { class: "muted small", text: "Code : " + P.ui.specCodes[pid] })),
      h("p", { class: "callout-note", text: P.ui.model.specification }),
      h("section", { class: "d-sec" }, h("h3", { text: "Prémisse" }), h("p", { text: p.premise })),
      h("section", { class: "d-sec" }, h("h3", { text: "Proposition examinée" }), h("p", { text: p.claim })),
      h("details", { class: "more" }, h("summary", { text: "Détail scientifique" }),
        h("p", { class: "lab", text: "À préciser dans une situation" }), h("p", { text: p.missing }),
        h("p", { class: "lab", text: "Ce que cette conception n'implique pas" }), h("p", { text: p.not_implied }),
        h("p", { class: "lab", text: P.ui.provenance.authors }), U.refList(p.sources))));
  }

  function dossierBlock(c) {
    var sec = h("section", { class: "dossier", "data-anchor": "dossier", "aria-label": "Dossier commun" });
    sec.appendChild(h("div", { class: "dos-head" },
      h("span", { class: "dos-k", text: "Dossier commun" }),
      h("span", { class: "tag-built", text: "Situation construite" }),
      h("span", { class: "dos-ctx", text: c.context })));
    sec.appendChild(h("h2", { class: "dos-title", id: "case-title" }, h("span", { class: "cid", text: c.id }), " ", c.title));
    sec.appendChild(h("p", { class: "dos-obj" }, h("span", { class: "lab inline", text: "Objectif commun · " }), c.objective));
    sec.appendChild(h("p", { class: "lab", text: "Faits et hypothèses du dossier" }));
    sec.appendChild(h("ol", { class: "dos-facts" }, c.facts.map(function (f) { return h("li", { text: f }); })));
    if (c.limits) sec.appendChild(h("p", { class: "dos-limits", role: "note" }, h("span", { class: "lab inline", text: "Hypothèses et limites du cas · " }), c.limits));
    sec.appendChild(h("details", { class: "more" }, h("summary", { text: "Ce que le cas met à l'épreuve, note d'ensemble" }),
      h("p", null, h("span", { class: "lab inline", text: "Épreuve · " }), c.test),
      h("p", null, h("span", { class: "lab inline", text: "Note sur l'ensemble du dossier · " }), c.editorial_note),
      h("p", { class: "muted small", text: "Cette note porte sur le dossier dans son ensemble ; elle ne résume pas chaque paire de lectures." }),
      h("p", { class: "muted small", text: c.kind + " · empreinte du dossier " + c.dossier_hash.slice(0, 16) })));
    return sec;
  }

  function readingColumn(c, pid, i, state, api) {
    var letter = i === 0 ? "A" : "B";
    var r = c.readings[pid], p = P.profile(pid);
    var col = h("div", { class: "r-col" + (state.flash === i ? " flash" : ""), "data-slot": String(i), "aria-label": "Lecture " + letter + " : " + p.name });
    var head = h("div", { class: "r-head" });
    if (!state.textOnly) {
      var dial = P.createDial({
        uid: "i" + i, conceptions: P.conceptions, conceptionId: pid, rays: P.dimRays,
        name: "Prisme " + letter + " : conception de la valeur sociale",
        initial: api.initialFor(i),
        onChange: function (id) { api.setSlot(i, id); },
      });
      col._dial = dial;
      head.appendChild(dial.el);
    } else {
      head.appendChild(h("label", { class: "txt-sel" }, h("span", { text: "Conception " + letter }),
        h("select", { id: "sel-slot-" + i, onchange: function (e) { api.setSlot(i, e.target.value); } },
          P.conceptions.map(function (cc) { return h("option", { value: cc.id, selected: cc.id === pid, text: cc.label }); }))));
    }
    head.appendChild(h("button", { type: "button", class: "conc-name", id: "conc-" + letter, onclick: function () { openProfileApplied(pid, letter); } },
      h("span", { class: "conc-kick", text: "Conception mobilisée · " + letter }),
      h("span", { class: "cn-row" }, h("span", { class: "letter", text: letter }), h("span", { class: "cn", text: p.name }), h("span", { class: "chev", "aria-hidden": "true", text: "›" }))));
    head.appendChild(h("p", { class: "spec-chip", text: specLabel(pid) }));
    col.appendChild(head);

    var dims = h("div", { class: "r-dims" });
    P.dims.forEach(function (d) {
      dims.appendChild(U.dimCard(d, { text: r.dimensions[d.id].text, compact: true, onclick: function () { U.openDimension(d.id, { profileId: pid, reading: r, caseId: c.id }); } }));
    });
    col.appendChild(dims);

    col.appendChild(h("section", { class: "r-out", "aria-label": "Conclusion de la lecture " + letter },
      h("p", { class: "status", text: P.ui.statusLabels[r.status] || r.status }),
      h("p", { class: "out-k", text: "Conclusion autorisée" }),
      h("p", { class: "out-main", text: r.conclusion }),
      h("p", { class: "out-scope" }, h("span", { class: "lab inline", text: "Portée · " }), r.scope),
      h("p", { class: "out-k", text: "Pourquoi cette conclusion ?" }),
      h("p", { class: "out-why", text: r.justification }),
      h("p", { class: "out-k", text: "Limite de cette conclusion" }),
      h("p", { class: "out-limit", text: r.reserve }),
      h("button", { type: "button", class: "link-light small refs-btn", onclick: function () { openReadingSources(c, pid, letter); } }, "Prémisses, spécification et références ›")));
    return col;
  }

  /*
   * state : { caseId, slots: [pid, pid], show: 0|1, textOnly, flash }
   * api : { setCase(id), setSlot(i, pid), setShow(i), setTextOnly(b), initialFor(i) }
   */
  P.renderIllustrations = function (state, api) {
    var c = P.caseById(state.caseId);
    var root = h("div", { class: "illus" });
    var scene = h("section", { class: "optic illus-scene", "aria-label": "Illustration" });
    var ov = document.createElementNS(NS, "svg"); ov.setAttribute("class", "rays-overlay"); ov.setAttribute("aria-hidden", "true");
    scene.appendChild(ov);
    var inner = h("div", { class: "wrap illus-inner" });
    scene.appendChild(inner);

    /* choix du cas : entrée principale */
    inner.appendChild(h("div", { class: "case-bar" },
      h("label", { class: "case-sel" }, h("span", { class: "lab inline", text: "Cas" }),
        h("select", { id: "case-select", onchange: function (e) { api.setCase(e.target.value); } },
          D.cases.map(function (x) { return h("option", { value: x.id, selected: x.id === c.id, text: x.id + " · " + x.title }); }))),
      h("div", { class: "quick", role: "group", "aria-label": "Cas démonstratifs" }, P.ui.quickCases.map(function (q) {
        return h("button", { type: "button", class: "chip" + (q.id === c.id ? " on" : ""), "aria-pressed": String(q.id === c.id), "data-case": q.id, title: q.label, onclick: function () { api.setCase(q.id); } },
          h("b", { text: q.id }), " " + q.label);
      }))));

    inner.appendChild(dossierBlock(c));
    inner.appendChild(h("div", { class: "ab-switch seg dark", role: "group", "aria-label": "Lecture affichée" }, [0, 1].map(function (i) {
      return h("button", { type: "button", class: "chip" + (state.show === i ? " on" : ""), "aria-pressed": String(state.show === i), id: "show-" + i, onclick: function () { api.setShow(i); } },
        (i ? "B · " : "A · ") + P.profile(state.slots[i]).name);
    })));

    inner.appendChild(h("div", { class: "read-lamp" }, h("span", { class: "lamp-glow", "data-anchor": "lamp", "aria-hidden": "true" }),
      h("span", { class: "rl-txt", text: "Lecture évaluative du même dossier, selon deux conceptions" })));

    var cols = h("div", { class: "readings", "data-show": String(state.show) });
    var colEls = state.slots.map(function (pid, i) { return readingColumn(c, pid, i, state, api); });
    colEls.forEach(function (e) { cols.appendChild(e); });
    inner.appendChild(cols);

    inner.appendChild(h("div", { class: "scene-foot" },
      h("p", { class: "hint-turn", text: "Tourner un prisme change la conception d'une lecture. Le dossier reste le même." }),
      h("p", { class: "muted-light", text: "Les statuts portent sur la proposition affichée ; ils ne forment pas une échelle commune." }),
      h("button", { type: "button", class: "link-light small", id: state.textOnly ? "view-bench" : "view-text", onclick: function () { api.setTextOnly(!state.textOnly); } }, state.textOnly ? "Revenir aux prismes" : "Version texte")));
    root.appendChild(scene);

    /* analyses complémentaires, hors du parcours principal */
    var below = h("div", { class: "wrap below" });
    var audit = P.auditFor(state.slots[0], state.slots[1]);
    if (audit) {
      below.appendChild(h("details", { class: "card aside-card", id: "audit" },
        h("summary", { text: "Analyse transversale documentée pour ces deux conceptions" }),
        h("p", { class: "lead-s", text: audit.result }),
        h("p", null, h("span", { class: "lab inline", text: "Nature de l'écart · " }), audit.nature),
        h("p", null, h("span", { class: "lab inline", text: "Cas témoins · " }), audit.witness.join(", ")),
        h("p", null, h("span", { class: "lab inline", text: "Contrôles · " }), audit.control),
        h("p", { class: "muted small", text: "Cette analyse porte sur les cas témoins indiqués. Elle ne constitue pas un résumé automatique du cas affiché." })));
    }
    var sens = P.sensitivityFor(c.id);
    if (sens.length) {
      below.appendChild(h("details", { class: "card aside-card", id: "sensitivity" },
        h("summary", { text: "Contrôles de sensibilité pour ce cas (" + sens.length + ")" }),
        h("p", { class: "muted small", text: "Ces contrôles modifient une hypothèse ou une spécification. Ils restent distincts de la rotation du prisme, qui garde les faits constants." }),
        sens.map(function (s) {
          return h("div", { class: "sens" },
            h("p", { class: "lab", text: s.id + " · " + s.change }),
            h("p", null, h("span", { class: "lab inline", text: "Avant · " }), s.before),
            h("p", null, h("span", { class: "lab inline", text: "Après · " }), s.after),
            h("p", null, h("span", { class: "lab inline", text: "Enseignement · " }), s.lesson),
            U.refList(s.sources));
        })));
    }
    below.appendChild(h("p", { class: "foot-links" },
      h("a", { href: "#/", text: "← Modèle conceptuel" }), " · ",
      h("button", { type: "button", class: "link", id: "notes-btn", onclick: U.openNotes }, "Statut et références")));
    root.appendChild(below);
    root._scene = scene;
    root._cols = colEls;
    return root;
  };

  /* Faisceaux : dossier → lampe → prismes → quatre dimensions → conclusion. */
  P.drawIllusRays = function (root) {
    if (!root || !root.isConnected) return;
    var scene = root._scene;
    var svg = scene.querySelector(".rays-overlay");
    var box = scene.getBoundingClientRect();
    svg.setAttribute("width", box.width); svg.setAttribute("height", box.height);
    svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    function rel(p) { return { x: p.x - box.left, y: p.y - box.top }; }
    function rect(el) { var r = el.getBoundingClientRect(); return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top, cx: (r.left + r.right) / 2 - box.left, w: r.width }; }
    function path(d, cls, color) { var e = document.createElementNS(NS, "path"); e.setAttribute("d", d); e.setAttribute("class", cls); if (color) e.setAttribute("stroke", color); svg.appendChild(e); }

    var dos = rect(scene.querySelector('[data-anchor="dossier"]'));
    var lamp = rect(scene.querySelector('[data-anchor="lamp"]'));
    var sw = scene.querySelector(".ab-switch");
    if (!sw || sw.getBoundingClientRect().width === 0) path("M" + lamp.cx + " " + dos.b + " L " + lamp.cx + " " + (lamp.t + 4), "dossier-line");
    root._cols.forEach(function (col) {
      var dial = col._dial;
      if (!dial || !dial.visible()) return;
      var en = rel(dial.entry()), ex = rel(dial.exit());
      var ly = lamp.t + (lamp.b - lamp.t) / 2;
      var d0 = "M" + lamp.cx + " " + ly + " C " + lamp.cx + " " + (ly + 60) + ", " + en.x + " " + (en.y - 80) + ", " + en.x + " " + en.y;
      path(d0, "beam-glow"); path(d0, "beam-core");
      var name = rect(col.querySelector(".conc-name"));
      var cards = [].slice.call(col.querySelectorAll(".r-dims .dim-card")).map(rect);
      var out = rect(col.querySelector(".r-out"));
      var n = cards.length;
      cards.forEach(function (c, j) {
        var color = P.dimRays[j];
        var lane = c.l - 10 - (n - 1 - j) * 6;
        var spread = (j - (n - 1) / 2) * 4;
        var yy = name.t - 10 - (n - 1 - j) * 6;
        var y1 = Math.min(ex.y + 16, yy - 18);
        var ty = c.t + 20;
        var d = "M" + (ex.x + spread) + " " + ex.y + " L " + (ex.x + spread) + " " + y1 +
          " C " + (ex.x + spread) + " " + (yy - 4) + ", " + (ex.x + spread - 24) + " " + yy + ", " + (ex.x - 50) + " " + yy +
          " L " + (lane + 12) + " " + yy + " Q " + lane + " " + yy + ", " + lane + " " + (yy + 12) +
          " L " + lane + " " + (ty - 10) + " Q " + lane + " " + ty + ", " + (lane + 10) + " " + ty + " L " + (c.l + 2) + " " + ty;
        path(d, "ray-glow", color); path(d, "ray-core", color);
        /* la même exigence rejoint la conclusion */
        var oy = out.t + 18 + j * 6;
        path("M" + lane + " " + ty + " L " + lane + " " + (oy - 10) + " Q " + lane + " " + oy + ", " + (lane + 10) + " " + oy + " L " + (out.l + 2) + " " + oy, "ray-core thin", color);
      });
    });
  };
})();
