/*
 * Illustrations : démonstration guidée (aides techniques à domicile), puis deux exemples statiques.
 * Le dossier existe en deux versions : A (initial) et B (A plus l'appréciation des personnes).
 * Les deux lectures sont toujours tirées de la même version du dossier.
 */
(function () {
  var P = window.PRISME;
  var C = P.C;
  var I = C.illustrations;
  var X = I.principal;
  var L = C.libelles;
  var h = P.h;
  var U = P.comp;
  var NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function version(id) { return X.versions.filter(function (v) { return v.id === id; })[0]; }
  function reading(v, cid) { return v.lectures.filter(function (l) { return l.conception === cid; })[0]; }
  function sentences(t) { return t.match(/[^.]+\.(\s|$)/g).map(function (s) { return s.trim(); }); }

  /* Faits du dossier ; dans une version dérivée, les phrases absentes de la version mère sont marquées. */
  function facts(v) {
    var p = h("p", { class: "dos-facts" });
    if (!v.herite_de) { p.textContent = v.faits_communs; return p; }
    var prev = sentences(version(v.herite_de).faits_communs);
    var kept = [], added = [];
    sentences(v.faits_communs).forEach(function (s) { (prev.indexOf(s) >= 0 && !added.length ? kept : added).push(s); });
    p.appendChild(document.createTextNode(kept.join(" ") + (added.length ? " " : "")));
    if (added.length) p.appendChild(h("mark", { class: "added" }, h("span", { class: "sr-only", text: "Information ajoutée : " }), added.join(" ")));
    return p;
  }

  function statusChip(t, open) {
    return h("p", { class: "status" + (open ? " open" : "") }, t);
  }

  function readingCard(v, cid, state, api) {
    var c = P.conception(cid);
    var r = reading(v, cid);
    var tag = null;
    if (v.herite_de) {
      var before = reading(version(v.herite_de), cid);
      tag = before.affirmation === r.affirmation ? "Conclusion inchangée" : "Conclusion actualisée";
    }
    var det = h("details", { class: "more reasoning" }, h("summary", { text: L.detail_raisonnement }),
      h("ul", { class: "r-rubs" }, P.fonctions.map(function (f) {
        var col = P.colors[f.id];
        return h("li", { style: "--dim:" + col.ray + ";--dim-tint:" + col.tint },
          h("span", { class: "rr-k" }, h("span", { class: "dot", "aria-hidden": "true" }), f.terme),
          h("span", { class: "rr-t", text: r.rubriques[f.id] }));
      })));
    if (state.open[cid]) det.open = true;
    det.addEventListener("toggle", function () { state.open[cid] = det.open; });
    return h("article", { class: "r-card" + (tag === "Conclusion actualisée" ? " changed" : ""), "data-c": cid, "aria-labelledby": "rc-" + cid },
      h("header", { class: "rc-head" },
        P.miniPrism(cid, P.rays),
        h("div", null,
          h("h3", { id: "rc-" + cid, class: "rc-name", text: c.nom }),
          h("p", { class: "rc-reason", text: c.raison_courte }))),
      h("div", { class: "rc-body" },
        h("p", { class: "out-k" }, "Conclusion", tag ? h("span", { class: "upd", text: tag }) : null),
        h("p", { class: "out-main", text: r.affirmation }),
        statusChip(r.statut_affichage, /^À étayer/.test(r.statut_affichage)),
        h("p", { class: "out-k", text: "Périmètre" }),
        h("p", { class: "out-scope", text: r.portee }),
        h("p", { class: "out-k", text: "Pourquoi" }),
        h("p", { class: "out-why", text: r.pourquoi })),
      det);
  }

  U.openExampleSources = function () {
    var d = X.details;
    U.openDrawer(h("div", { class: "drawer-body" },
      h("p", { class: "eyebrow", text: I.mention }),
      h("h2", { id: "drawer-title", text: X.titre }),
      U.section("Prémisses", U.p(d.premisses)),
      U.section("Limite", U.p(d.limite)),
      U.section("Construction", U.p(d.deduction)),
      U.section("Origine", U.p(X.origine)),
      U.section("Sources", U.refList(X.sources, true))));
  };

  /*
   * state : { version: "A"|"B", open: { S: bool, I: bool }, notice: string|null }
   * api : { setVersion(id) }
   */
  P.renderIllustrations = function (state, api) {
    var v = version(state.version);
    var pair = I.couple_initial;
    var scene = h("section", { class: "optic illus", id: "illus", "aria-labelledby": "page-title" });
    scene.appendChild(svgEl("svg", { class: "rays-overlay", "aria-hidden": "true" }));
    var inner = h("div", { class: "wrap illus-inner" });
    scene.appendChild(inner);

    inner.appendChild(h("header", { class: "i-head" },
      h("h2", { id: "page-title", text: I.titre }),
      h("p", { class: "i-sub" }, h("span", { class: "tag-built", text: I.mention }), h("span", { class: "i-case", text: X.titre }))));

    /* 1. le dossier commun */
    var dossier = h("section", { class: "dossier", id: "dossier", tabindex: "-1", "data-anchor": "dossier", "aria-labelledby": "dos-t" },
      v.bandeau ? h("p", { class: "dos-band", role: "status", text: v.bandeau }) : null,
      h("div", { class: "dos-head" },
        h("h3", { class: "dos-k", id: "dos-t", text: "Dossier commun" }),
        h("span", { class: "dos-ver", text: "Version " + v.id + " · " + v.titre.toLowerCase() })),
      facts(v));
    inner.appendChild(dossier);

    /* 2. deux lectures du même dossier */
    inner.appendChild(h("div", { class: "readings" }, pair.map(function (cid) { return readingCard(v, cid, state, api); })));

    /* 3. ce qui distingue les conclusions */
    inner.appendChild(h("p", { class: "i-expl", text: v.explication }));

    /* 4. ajouter l'information, ou revenir */
    var actions = h("div", { class: "i-actions" });
    if (state.version === X.versions[0].id) {
      actions.appendChild(h("button", { type: "button", class: "btn cta", id: "add-info", onclick: function () { api.setVersion(X.versions[1].id); } }, X.bouton_ajout));
    } else {
      actions.appendChild(h("p", { class: "i-note", text: X.note_complement }));
      actions.appendChild(h("button", { type: "button", class: "btn ghost", id: "back-info", onclick: function () { api.setVersion(X.versions[0].id); } }, X.bouton_retour));
    }
    actions.appendChild(h("button", { type: "button", class: "link-light small", id: "example-sources", onclick: U.openExampleSources }, L.detail_sources));
    inner.appendChild(actions);

    var page = h("div", null, scene, renderOthers());
    page._scene = scene;
    return page;
  };

  /* Deux autres exemples, fermés par défaut et statiques. */
  function renderOthers() {
    var cps = I.complementaires;
    return h("section", { class: "page others", "aria-labelledby": "others-t" },
      h("h2", { id: "others-t", text: L.autres_exemples }),
      cps.map(function (e) {
        var body;
        if (e.lectures) {
          body = [
            h("ul", { class: "o-reads" }, e.lectures.map(function (l) {
              return h("li", null, h("span", { class: "o-c" }, P.miniPrism(l.conception, P.rays), P.conception(l.conception).nom),
                h("p", { class: "o-aff", text: l.affirmation }), h("p", { class: "muted small", text: l.raison }));
            })),
            h("p", { class: "o-learn", text: e.enseignement }),
            h("p", { class: "small", text: e.premisse_visible }),
            h("p", { class: "muted small", text: e.detail }),
          ];
        } else {
          body = [
            h("p", { class: "o-c" }, P.miniPrism(e.conception, P.rays), P.conception(e.conception).nom),
            h("ul", { class: "o-reads" }, e.affirmations.map(function (a) {
              return h("li", null, h("p", { class: "o-aff", text: a.enonce }), statusChip(a.conclusion, /à étayer/.test(a.conclusion)));
            })),
            h("p", { class: "o-learn", text: e.enseignement }),
            h("p", { class: "small", text: e.complement }),
            h("p", { class: "muted small", text: e.detail }),
          ];
        }
        return h("details", { class: "card other", id: "ex-" + e.id },
          h("summary", null, h("span", { class: "o-title", text: e.titre }), h("span", { class: "tag-built light", text: I.mention })),
          h("p", { class: "o-facts", text: e.faits_communs }),
          body,
          h("p", { class: "muted small" }, e.origine + " Sources : ",
            e.sources.map(function (id, i) {
              var r = P.ref(id);
              return [i ? " ; " : "", h("a", { href: r.url, target: "_blank", rel: "noopener noreferrer", text: P.refLabel(r) })];
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
    function rect(el) { var r = el.getBoundingClientRect(); return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top, cx: (r.left + r.right) / 2 - box.left, w: r.width }; }
    var dos = rect(scene.querySelector('[data-anchor="dossier"]'));
    var cards = [].slice.call(scene.querySelectorAll(".r-card")).map(rect);
    if (cards.length < 2) return;
    var stacked = cards[1].t > cards[0].b - 2;
    var targets = stacked ? [cards[0]] : cards;
    targets.forEach(function (c) {
      var a = { x: dos.cx, y: dos.b }, b = { x: c.cx, y: c.t };
      var my = (a.y + b.y) / 2;
      svg.appendChild(svgEl("path", { class: "dossier-line", d: "M" + a.x + " " + a.y + " C " + a.x + " " + my + ", " + b.x + " " + my + ", " + b.x + " " + b.y }));
    });
  };
})();
