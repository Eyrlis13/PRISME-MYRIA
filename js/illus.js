/*
 * Illustrations : démonstration guidée sur le cas construit des aides techniques (data/rapports/aides-techniques-domicile.json),
 * deux conceptions au choix parmi cinq, dossier initial puis dossier enrichi ; ensuite deux exemples statiques.
 * Les deux lectures sont toujours tirées de la même version du dossier.
 */
(function () {
  var P = window.PRISME;
  var IL = P.IL;
  var h = P.h;
  var U = P.comp;
  var NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  /* Lecture d'une conception pour une version du dossier : la version enrichie remplace les champs fournis. */
  P.lecture = function (rapport, enonce, cid, versionId) {
    var base = enonce.lectures[cid];
    if (!base) return null;
    var v = versionId && (rapport.versions || []).filter(function (x) { return x.id === versionId; })[0];
    var upd = v && v.lectures_mises_a_jour && v.lectures_mises_a_jour[enonce.id] && v.lectures_mises_a_jour[enonce.id][cid];
    if (!upd) return base;
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(upd).forEach(function (k) { out[k] = upd[k]; });
    out._actualisee = true;
    if (upd.issue && upd.issue !== base.issue) delete out.issues_detaillees;
    return out;
  };

  /* Issue d'une lecture : une puce, ou une puce par objet lorsque la lecture en porte plusieurs. */
  P.lectureIssues = function (l) {
    if (l.issues_detaillees && l.issues_detaillees.length) {
      return h("ul", { class: "issues-multi" }, l.issues_detaillees.map(function (x) {
        return h("li", null, h("span", { class: "im-k", text: x.porte_sur }), P.issueChip(x.issue));
      }));
    }
    return h("p", { class: "issue-line" }, P.issueChip(l.issue));
  };

  /* Volets d'une lecture, avec sa référence de valeur et sa cellule du répertoire. */
  P.voletsList = function (l) {
    var cell = P.cellule(l.cellule);
    return [
      h("p", { class: "ref-val" }, h("span", { class: "lab inline", text: "Référence de valeur · " }), l.reference_de_valeur),
      h("ul", { class: "r-rubs" }, P.volets.map(function (v) {
        var col = P.colors[v.id];
        return h("li", { style: "--dim:" + col.ray + ";--dim-tint:" + col.tint },
          h("span", { class: "rr-k" }, h("span", { class: "dot", "aria-hidden": "true" }), v.terme),
          h("span", { class: "rr-t", text: l.volets[v.id] }));
      })),
      cell ? h("p", { class: "muted small" }, "Cellule " + cell.id + " · " + cell.domaine + " · " + cell.formulation_courte) : null,
    ];
  };

  /* Dossier : action, objectif, standard, ce qui est établi, ce qui manque. Les champs vides sont masqués. */
  P.renderDossier = function (r, version, labelEtablit) {
    var d = r.dossier;
    var lacunes = version && version.lacunes ? version.lacunes : d.lacunes;
    function row(k, v) { return v ? h("div", { class: "dos-row" }, h("dt", { text: k }), h("dd", { text: v })) : null; }
    function list(k, items, cls, extra) {
      if ((!items || !items.length) && !extra) return null;
      return h("div", { class: "dos-row " + cls }, h("dt", { text: k }),
        h("dd", null, h("ul", { class: "dos-list" }, (items || []).map(function (t) { return h("li", { text: t }); }), extra)));
    }
    var added = version && version.information_ajoutee
      ? h("li", null, h("mark", { class: "added" }, h("span", { class: "sr-only", text: "Information ajoutée : " }), version.information_ajoutee))
      : null;
    return h("dl", { class: "dos-dl" },
      row("Action", d.action), row("Objectif", d.objectif), row("Standard", d.standard),
      list(labelEtablit, d.observations, "est", added),
      list("Ce qui manque", lacunes, "manque"));
  };

  function readingCard(r, e, cid, other, side, state, api) {
    var c = P.conception(cid);
    var l = P.lecture(r, e, cid, state.version === "A" ? null : state.version);
    var base = e.lectures[cid];
    var tag = null;
    if (l._actualisee) tag = l.issue === base.issue ? "Issue inchangée" : "Issue actualisée";
    var picker = P.conceptionPicker({ label: side === 0 ? "Première conception" : "Seconde conception", value: cid, other: other,
      onChange: function (id) { api.setPair(side, id); } });
    var det = h("details", { class: "more reasoning" }, h("summary", { text: "Voir les quatre volets" }), P.voletsList(l));
    var key = side + cid;
    if (state.open[key]) det.open = true;
    det.addEventListener("toggle", function () { state.open[key] = det.open; });
    return h("article", { class: "r-card" + (tag === "Issue actualisée" ? " changed" : ""), "data-c": cid, "data-side": side, "aria-labelledby": "rc-" + side },
      picker.el,
      h("header", { class: "rc-head" },
        h("h3", { id: "rc-" + side, class: "rc-name", text: c.nom }),
        h("p", { class: "rc-reason", text: c.raison_courte })),
      h("div", { class: "rc-body" },
        h("p", { class: "out-k", text: "Affirmation examinée" }),
        h("p", { class: "out-main", text: l.affirmation }),
        h("p", { class: "out-k" }, "Issue", tag ? h("span", { class: "upd", text: tag }) : null),
        P.lectureIssues(l),
        h("p", { class: "out-k", text: "Pourquoi" }),
        h("p", { class: "out-why", text: l.pourquoi }),
        l.ce_qui_changerait_l_issue ? [h("p", { class: "out-k", text: "Ce qui changerait l’issue" }), h("p", { class: "out-why", text: l.ce_qui_changerait_l_issue })] : null),
      det);
  }

  function openExampleSources(r, e) {
    var prem = P.ids.map(function (cid) { var l = e.lectures[cid]; return l && l.premisse_ajoutee ? [P.conception(cid).nom, l.premisse_ajoutee] : null; }).filter(Boolean);
    U.openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: r.statut_affichage }),
      h("h2", { id: "drawer-title", text: r.titre }),
      U.section("Source", U.p(r.source)),
      prem.length ? U.section("Prémisses ajoutées par l’analyse", h("ul", { class: "plain" }, prem.map(function (p) { return h("li", null, h("span", { class: "lab inline", text: p[0] + " · " }), p[1]); }))) : null,
      U.section("Limites", U.p(r.limites)),
      U.section("Références", U.refList(["DCJ2025"], true))));
  }

  /*
   * state : { version: "A"|"B", pair: [id, id], open: {} }
   * api : { setVersion(id), setPair(side, id) }
   */
  P.renderIllustrations = function (state, api, rapports) {
    var r = rapports.list.filter(function (x) { return x.id === IL.cas; })[0];
    var scene = h("section", { class: "optic illus", id: "illus", "aria-labelledby": "page-title" });
    scene.appendChild(svgEl("svg", { class: "rays-overlay", "aria-hidden": "true" }));
    var inner = h("div", { class: "wrap illus-inner" });
    scene.appendChild(inner);
    inner.appendChild(h("header", { class: "i-head" },
      h("h2", { id: "page-title", text: IL.titre }),
      h("p", { class: "i-sub" }, h("span", { class: "tag-built", text: IL.mention }), r ? h("span", { class: "i-case", text: r.titre }) : null)));
    var page = h("div", null, scene);
    page._scene = scene;
    if (!r) { inner.appendChild(h("p", { class: "i-expl", text: "Le cas de démonstration n’est pas disponible." })); return page; }

    var e = r.enonces[0];
    var v = state.version === "A" ? null : (r.versions || []).filter(function (x) { return x.id === state.version; })[0];

    /* 1. le dossier commun */
    inner.appendChild(h("section", { class: "dossier", id: "dossier", tabindex: "-1", "data-anchor": "dossier", "aria-labelledby": "dos-t" },
      v && v.bandeau ? h("p", { class: "dos-band", role: "status", text: v.bandeau }) : null,
      h("div", { class: "dos-head" },
        h("h3", { class: "dos-k", id: "dos-t", text: "Dossier commun" }),
        h("span", { class: "dos-ver", text: v ? "Version " + v.id + " · " + v.titre.toLowerCase() : "Version A · dossier initial" })),
      P.renderDossier(r, v, "Ce que le dossier établit")));

    /* 2. deux lectures du même dossier, au choix parmi cinq */
    var pair = state.pair;
    inner.appendChild(h("div", { class: "readings" }, pair.map(function (cid, i) { return readingCard(r, e, cid, pair[1 - i], i, state, api); })));

    /* 3. ce qui distingue les deux conclusions, et l'enseignement de la nouvelle version */
    var la = P.lecture(r, e, pair[0], v && v.id), lb = P.lecture(r, e, pair[1], v && v.id);
    inner.appendChild(h("p", { class: "i-expl", id: "comparaison", text: P.comparaison(pair[0], la, pair[1], lb) }));
    if (v && v.enseignement) inner.appendChild(h("p", { class: "i-teach", text: v.enseignement }));

    /* 4. ajouter l'information, ou revenir */
    var actions = h("div", { class: "i-actions" });
    if (!v && r.versions && r.versions.length) {
      actions.appendChild(h("button", { type: "button", class: "btn cta", id: "add-info", onclick: function () { api.setVersion(r.versions[0].id); } }, IL.bouton_ajout));
    } else if (v) {
      actions.appendChild(h("button", { type: "button", class: "btn ghost", id: "back-info", onclick: function () { api.setVersion("A"); } }, IL.bouton_retour));
    }
    actions.appendChild(h("button", { type: "button", class: "link-light small", id: "example-sources", onclick: function () { openExampleSources(r, e); } }, IL.libelles.detail_sources));
    inner.appendChild(actions);

    page.appendChild(renderOthers());
    return page;
  };

  /* Deux autres exemples, fermés par défaut et statiques. */
  function renderOthers() {
    return h("section", { class: "page others", "aria-labelledby": "others-t" },
      h("h2", { id: "others-t", text: IL.libelles.autres_exemples }),
      IL.complementaires.map(function (e) {
        var body;
        if (e.lectures) {
          body = [
            h("ul", { class: "o-reads" }, e.lectures.map(function (l) {
              return h("li", null, h("span", { class: "o-c" }, P.miniPrism(l.conception, P.rays), P.conception(l.conception).nom),
                h("p", { class: "o-aff", text: l.affirmation }), P.issueChip(l.issue), h("p", { class: "muted small", text: l.raison }));
            })),
            h("p", { class: "o-learn", text: e.enseignement }),
            h("p", { class: "small", text: e.premisse_visible }),
            h("p", { class: "muted small", text: e.detail }),
          ];
        } else {
          body = [
            h("p", { class: "o-c" }, P.miniPrism(e.conception, P.rays), P.conception(e.conception).nom),
            h("ul", { class: "o-reads" }, e.affirmations.map(function (a) {
              return h("li", null, h("p", { class: "o-aff", text: a.enonce }), P.issueChip(a.issue));
            })),
            h("p", { class: "o-learn", text: e.enseignement }),
            h("p", { class: "small", text: e.complement }),
            h("p", { class: "muted small", text: e.detail }),
          ];
        }
        return h("details", { class: "card other", id: "ex-" + e.id },
          h("summary", null, h("span", { class: "o-title", text: e.titre }), h("span", { class: "tag-built light", text: IL.mention })),
          h("p", { class: "o-facts", text: e.faits_communs }),
          body,
          h("p", { class: "muted small" }, e.origine + " Sources : ",
            e.sources.map(function (id, i) {
              var ref = P.ref(id);
              return [i ? " ; " : "", h("a", { href: ref.url, target: "_blank", rel: "noopener noreferrer", text: P.refLabel(ref) })];
            })));
      }));
  }

  /* Le même dossier alimente les deux lectures : un trait couleur papier, du dossier vers chaque carte. */
  P.drawIllusRays = function (page) {
    var scene = page && page._scene;
    if (!scene || !scene.isConnected) return;
    var svg = scene.querySelector(".rays-overlay");
    var box = scene.getBoundingClientRect();
    svg.setAttribute("width", box.width); svg.setAttribute("height", box.height);
    svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var dosEl = scene.querySelector('[data-anchor="dossier"]');
    if (!dosEl) return;
    function rect(el) { var r = el.getBoundingClientRect(); return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top, cx: (r.left + r.right) / 2 - box.left, w: r.width }; }
    var dos = rect(dosEl);
    var cards = [].slice.call(scene.querySelectorAll(".r-card")).map(rect);
    if (cards.length < 2) return;
    var stacked = cards[1].t > cards[0].b - 2;
    (stacked ? [cards[0]] : cards).forEach(function (c) {
      var a = { x: dos.cx, y: dos.b }, b = { x: c.cx, y: c.t };
      var my = (a.y + b.y) / 2;
      svg.appendChild(svgEl("path", { class: "dossier-line", d: "M" + a.x + " " + a.y + " C " + a.x + " " + my + ", " + b.x + " " + my + ", " + b.x + " " + b.y }));
    });
  };
})();
