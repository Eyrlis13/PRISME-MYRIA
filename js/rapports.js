/*
 * Rapports analysés : une revendication, deux prismes. Sans explication.
 * Les analyses sont produites dans Claude Code par la compétence prisme-rapport
 * (fichiers data/rapports/*.json, réunis par tools/build-data.js).
 */
(function () {
  var P = window.PRISME;
  var C = P.C, L = C.libelles;
  var h = P.h;
  var NS = "http://www.w3.org/2000/svg";

  function rapport(id) { return P.R.filter(function (r) { return r.id === id; })[0]; }

  /*
   * state : { rapport: id, rev: id, left: cid, right: cid }
   * api : { set(patch) }
   */
  P.renderRapports = function (state, api) {
    var scene = h("section", { class: "optic illus rapports", id: "rapports", "aria-labelledby": "page-title" });
    var svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "rays-overlay"); svg.setAttribute("aria-hidden", "true");
    scene.appendChild(svg);
    var inner = h("div", { class: "wrap illus-inner" });
    scene.appendChild(inner);

    if (!P.R.length) {
      inner.appendChild(h("header", { class: "i-head" }, h("h2", { id: "page-title", text: C.rapports.titre })));
      inner.appendChild(h("p", { class: "i-expl", text: "Aucun rapport analysé." }));
      return scene;
    }
    var R = rapport(state.rapport) || P.R[0];
    state.rapport = R.id;
    var rev = R.revendications.filter(function (x) { return x.id === state.rev; })[0] || R.revendications[0];
    state.rev = rev.id;
    if (state.lastRev !== rev.id) {
      state.lastRev = rev.id;
      var inv = rev.conception_invoquee && rev.conception_invoquee.id;
      state.left = inv || "S";
      if (state.right === state.left) state.right = state.left === "I" ? "S" : "I";
    }

    var rsel = h("select", { class: "dom-select rap-select", "aria-label": "Rapport",
      onchange: function () { api.set({ rapport: rsel.value, rev: null }); } },
      P.R.map(function (r) { return h("option", { value: r.id, text: r.organisation + " · " + r.annee }); }));
    rsel.value = R.id;
    inner.appendChild(h("header", { class: "i-head rap-head" },
      h("h2", { id: "page-title", text: C.rapports.titre }), rsel));
    inner.appendChild(h("p", { class: "rap-meta" }, h("strong", { text: R.titre }), " · ", R.perimetre, R.donnees ? " " + R.donnees : ""));

    /* profil du rapport : revendications × conceptions */
    function first(l) { return l.options ? l.options[0] : l; }
    var CS = C.conceptions;
    var tbl = h("table", { class: "prof" },
      h("thead", null, h("tr", null, h("th", { scope: "col", text: L.revendication }),
        CS.map(function (c) { return h("th", { scope: "col" }, P.miniPrism(c.id, P.rays), h("span", { text: c.nom })); }))),
      h("tbody", null, R.revendications.map(function (x) {
        var inv = x.conception_invoquee && x.conception_invoquee.id;
        return h("tr", { class: x.id === rev.id ? "on" : null },
          h("th", { scope: "row" }, h("button", { type: "button", class: "prof-rev", "aria-pressed": x.id === rev.id ? "true" : "false", title: x.enonce,
            onclick: function () { api.set({ rev: x.id }); } }, h("strong", { text: x.id }), " " + x.court)),
          CS.map(function (c) {
            var r = first(x.lectures[c.id]);
            var nom = r.verdict === "ouvert" ? "ouvert" : P.verdict(r.verdict).nom;
            return h("td", { class: inv === c.id ? "inv" : null },
              h("button", { type: "button", class: "vchip cell v-" + r.verdict, title: (r.libelle ? r.libelle + " · " : "") + (r.pour_etayer ? r.pour_etayer.texte : r.manque),
                onclick: function () { api.set({ rev: x.id, left: c.id, lastRev: x.id }); } }, nom));
          }));
      })));
    inner.appendChild(h("div", { class: "prof-wrap", role: "region", "aria-label": L.profil, tabindex: "0" }, h("p", { class: "five-k", text: L.profil }), tbl));

    var dom = P.domaine(rev.domaine);
    inner.appendChild(h("section", { class: "dossier", id: "dossier", tabindex: "-1", "data-anchor": "dossier", "aria-labelledby": "rev-t" },
      h("div", { class: "dos-head" },
        h("h3", { class: "dos-k", id: "rev-t", text: L.revendication + " " + rev.id }),
        h("span", { class: "dos-ver", text: rev.pages + " · " + dom.nom })),
      h("p", { class: "dos-claim", text: rev.enonce }),
      rev.citation ? h("p", { class: "dos-quote", text: "« " + rev.citation + " »" }) : null,
      h("p", { class: "dos-k claim-k", text: L.preuves_rapport }),
      h("ul", { class: "dos-ev" }, rev.preuves.map(function (p) { return h("li", null, p.texte, p.pages ? h("span", { class: "dos-p", text: " (" + p.pages + ")" }) : null); })),
      rev.conception_invoquee && rev.conception_invoquee.id ? h("p", { class: "dos-inv" },
        "Conception invoquée : ", h("strong", { text: P.conception(rev.conception_invoquee.id).nom }),
        " (" + rev.conception_invoquee.mode + (rev.conception_invoquee.premisse ? " : " + rev.conception_invoquee.premisse : "") + ")") : null));

    function request(cid, texte) {
      return "PRISME : réévalue la revendication " + rev.id + " du rapport « " + R.id + " » sous " +
        (cid === "N" ? "le principe" : "l'obligation") + " : « " + texte + " ».";
    }
    var panels = h("div", { class: "readings two" });
    [["g", "left"], ["d", "right"]].forEach(function (p) {
      var panel = P.lecturePanel({ uid: p[0], lectures: rev.lectures, conception: state[p[1]], writable: true, request: request,
        onChange: function (cid) { state[p[1]] = cid; requestAnimationFrame(function () { P.drawDossierLines(scene); }); } });
      panels.appendChild(panel.el);
    });
    inner.appendChild(panels);

    /* pour étayer : la même revendication sous les cinq garanties */
    inner.appendChild(h("section", { class: "guide", "aria-label": L.guide },
      h("p", { class: "five-k", text: L.guide }),
      h("ul", { class: "guide-list" }, CS.map(function (c) {
        var l = rev.lectures[c.id], r = first(l);
        var pe = r.pour_etayer || {};
        return h("li", null,
          h("span", { class: "g-c" }, P.miniPrism(c.id, P.rays), c.nom),
          h("span", { class: "vchip v-" + r.verdict, text: r.verdict === "ouvert" ? "ouvert" : P.verdict(r.verdict).nom }),
          h("span", { class: "g-t" }, l.options ? h("em", { text: r.libelle + " · " }) : null, pe.texte || r.manque,
            pe.verdict_vise ? [" → ", h("span", { class: "vchip mini v-" + pe.verdict_vise, text: P.verdict(pe.verdict_vise).nom.toLowerCase() })] : null));
      }))));
    inner.appendChild(h("p", { class: "i-src", text: "Analyse : " + R.analyse.par + ", " + R.analyse.date + " · " + R.source }));
    scene._lines = true;
    return scene;
  };
})();
