/*
 * Illustration : l'expérience de pensée de l'article (aides techniques au transfert).
 * Le dossier et la revendication sont communs ; deux prismes orientables donnent chacun une lecture.
 * Les versions B, C et D ajoutent une preuve ou étendent la portée de la revendication.
 */
(function () {
  var P = window.PRISME;
  var X = P.X;
  var h = P.h;
  var NS = "http://www.w3.org/2000/svg";

  function dossier(id) { return X.dossiers.filter(function (d) { return d.id === id; })[0]; }
  function verdictOf(l) { return l.options ? l.options[0] : l; }

  /*
   * state : { version: "A".."D", left: cid, right: cid }
   * api : { setVersion(id) }
   */
  P.renderIllustration = function (state, api) {
    var d = dossier(state.version);
    var scene = h("section", { class: "optic illus", id: "illus", "aria-labelledby": "page-title" });
    var svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "rays-overlay"); svg.setAttribute("aria-hidden", "true");
    scene.appendChild(svg);
    var inner = h("div", { class: "wrap illus-inner" });
    scene.appendChild(inner);

    inner.appendChild(h("header", { class: "i-head" },
      h("h2", { id: "page-title", text: X.titre }),
      h("p", { class: "i-sub" }, h("span", { class: "tag-built", text: X.mention }), h("span", { class: "i-case", text: X.cas }))));

    var seg = h("div", { class: "seg dark ver-seg", role: "group", "aria-label": "Version du dossier" },
      X.dossiers.map(function (x) {
        return h("button", { type: "button", class: "chip" + (x.id === state.version ? " on" : ""), "aria-pressed": x.id === state.version ? "true" : "false",
          onclick: function () { api.setVersion(x.id); } }, x.nom);
      }));
    inner.appendChild(h("div", { class: "ver-row" }, seg));

    inner.appendChild(h("section", { class: "dossier", id: "dossier", tabindex: "-1", "data-anchor": "dossier", "aria-labelledby": "dos-t" },
      h("div", { class: "dos-head" }, h("h3", { class: "dos-k", id: "dos-t", text: "Dossier commun" }), h("span", { class: "dos-ver", text: d.nom })),
      h("p", { class: "dos-facts" }, d.faits, d.ajout ? [" ", h("mark", { class: "added" }, d.ajout)] : null),
      h("p", { class: "dos-k claim-k", text: "Revendication examinée" }),
      h("p", { class: "dos-claim" + (d.revendication_modifiee ? " changed" : ""), text: d.revendication })));

    var panels = h("div", { class: "readings two" });
    [["g", "left"], ["d", "right"]].forEach(function (p) {
      var panel = P.lecturePanel({ uid: p[0], lectures: d.lectures, conception: state[p[1]],
        onChange: function (cid) { state[p[1]] = cid; requestAnimationFrame(function () { P.drawDossierLines(scene); }); } });
      panels.appendChild(panel.el);
    });
    inner.appendChild(panels);

    /* les cinq verdicts sur ce dossier */
    inner.appendChild(h("section", { class: "five", "aria-label": "Les cinq verdicts" },
      h("p", { class: "five-k", text: "Les cinq verdicts sur ce dossier" }),
      h("ul", { class: "five-list" }, P.C.conceptions.map(function (c) {
        var l = d.lectures[c.id];
        var r = verdictOf(l);
        return h("li", null, P.miniPrism(c.id, P.rays), h("span", { class: "five-n", text: c.nom }),
          h("span", { class: "vchip v-" + r.verdict, text: P.verdict(r.verdict).nom }),
          l.options ? h("span", { class: "five-o", text: r.libelle }) : null);
      }))));
    inner.appendChild(h("p", { class: "i-src", text: X.source }));
    scene._lines = true;
    return scene;
  };
})();
