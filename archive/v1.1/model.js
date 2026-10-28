/*
 * Accueil : la chaîne Conception de la valeur → Critère et appréciation → Jugement justifié.
 * Le choix d'une conception (prisme ou boutons) actualise les formulations courtes des quatre
 * rubriques sans reconstruire la page : les rubriques dépliées le restent.
 */
(function () {
  var P = window.PRISME;
  var C = P.C;
  var A = C.accueil;
  var h = P.h;
  var U = P.comp;
  var NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  /* Les quatre fonctions communes aux cinq conceptions, et leur articulation (texte du brief). */
  var NOTE_FONCTIONS = "Les quatre fonctions sont communes aux cinq conceptions. Les flèches représentent leur articulation argumentative ; une évaluation peut procéder par allers-retours.";

  /*
   * state : { conception: "M"|"I"|"S"|"V"|"N" }
   * api : { setConception(id) }
   */
  P.renderModel = function (state, api) {
    var scene = h("section", { class: "optic model", id: "model", "aria-labelledby": "page-title" });
    scene.appendChild(svgEl("svg", { class: "rays-overlay", "aria-hidden": "true" }));
    var inner = h("div", { class: "wrap model-inner" });
    scene.appendChild(inner);

    inner.appendChild(h("header", { class: "m-head" },
      h("h2", { id: "page-title", text: A.titre }),
      h("p", { class: "m-lead", text: A.sous_titre }),
      h("p", { class: "m-statement" }, h("span", { class: "lab inline", text: "Le modèle · " }), A.enonce_modele)));

    var chain = h("div", { class: "chain" });

    /* A. Conception de la valeur */
    var blockA = h("section", { class: "c-a", "aria-labelledby": "chain-a" });
    var choose = h("div", { class: "c-choose" },
      h("h3", { class: "chain-k", id: "chain-a" }, h("span", { class: "chain-n", text: "A" }), A.chaine[0]));
    var list = h("ul", { class: "c-list", role: "list" });
    var buttons = {};
    var reason = h("p", { class: "c-reason", id: "c-reason", "aria-live": "polite" });
    C.conceptions.forEach(function (c) {
      var b = h("button", { type: "button", class: "c-btn", "data-c": c.id, "aria-pressed": "false", "aria-describedby": null,
        onclick: function () { select(c.id, true); } }, c.nom);
      buttons[c.id] = b;
      list.appendChild(h("li", null, b));
    });
    choose.appendChild(list);
    var typo = P.ref("DCJ2025");
    choose.appendChild(h("p", { class: "c-src" }, "Typologie : ",
      h("a", { href: typo.url, target: "_blank", rel: "noopener noreferrer", class: "light" }, P.refLabel(typo))));

    var prismCol = h("div", { class: "c-prism" },
      h("span", { class: "lamp-glow", "data-anchor": "lamp", "aria-hidden": "true" }));
    var dial = P.createDial({
      uid: "m", conceptions: P.conceptions, conceptionId: state.conception, rays: P.rays, initial: A.conception_initiale,
      name: "Prisme des cinq conceptions de la valeur",
      onChange: function (id) { select(id, false); },
    });
    prismCol.appendChild(dial.el);
    blockA.appendChild(choose);
    blockA.appendChild(prismCol);
    chain.appendChild(blockA);

    /* B. Critère et appréciation */
    var blockB = h("section", { class: "c-b frame", "aria-labelledby": "chain-b" });
    blockB.appendChild(h("div", { class: "c-b-head" },
      h("h3", { class: "chain-k", id: "chain-b" }, h("span", { class: "chain-n", text: "B" }), A.chaine[1]),
      h("p", { class: "c-note", text: NOTE_FONCTIONS })));
    var rubs = h("ol", { class: "rubs" });
    var formulations = {};
    P.fonctions.forEach(function (f, i) {
      var col = P.colors[f.id];
      var fEl = h("p", { class: "rub-f" });
      formulations[f.id] = fEl;
      rubs.appendChild(h("li", { class: "rub", "data-f": f.id, style: "--dim:" + col.ray + ";--dim-tint:" + col.tint },
        h("h4", { class: "rub-t" }, h("span", { class: "dot", "aria-hidden": "true" }), f.intitule),
        h("p", { class: "rub-term", text: f.terme }),
        fEl,
        h("details", { class: "rub-more" }, h("summary", { text: "Question et explication" }),
          h("p", { class: "rub-q", text: f.question }),
          h("p", { text: f.explication }))));
      if (i < P.fonctions.length - 1) rubs.appendChild(h("li", { class: "rub-arrow", "aria-hidden": "true" }, h("span", { text: "→" })));
    });
    blockB.appendChild(rubs);
    chain.appendChild(blockB);

    /* C. Jugement justifié */
    chain.appendChild(h("section", { class: "c-c", "aria-labelledby": "chain-c" },
      h("div", { class: "judge-card", "data-anchor": "judge" },
        h("h3", { class: "chain-k dark", id: "chain-c" }, h("span", { class: "chain-n", text: "C" }), A.chaine[2]),
        h("p", { class: "judge-out", text: A.sortie }))));
    inner.appendChild(chain);

    /* dossier commun */
    inner.appendChild(h("aside", { class: "dossier-band" },
      h("p", { class: "db-k", text: "Dossier commun" }),
      h("p", { class: "db-t", text: A.dossier_commun }),
      h("details", { class: "more" }, h("summary", { text: "Détail" }), h("p", { text: A.detail_dossier }))));

    inner.appendChild(h("div", { class: "m-cta" },
      h("a", { class: "btn cta", href: "#/illustrations", id: "to-illustrations", text: A.cta })));

    function select(id, rotate) {
      var c = P.conception(id);
      state.conception = id;
      Object.keys(buttons).forEach(function (k) {
        var on = k === id;
        buttons[k].setAttribute("aria-pressed", on ? "true" : "false");
        buttons[k].classList.toggle("on", on);
        if (on) buttons[k].parentNode.appendChild(reason);
      });
      reason.textContent = c.raison_courte;
      P.fonctions.forEach(function (f) { formulations[f.id].textContent = c.rubriques[f.id]; });
      if (rotate) dial.rotateTo(id);
      if (api && api.setConception) api.setConception(id);
      requestAnimationFrame(function () { P.drawModelRays(scene); });
    }
    select(state.conception, false);

    scene._dial = dial;
    return scene;
  };

  /* « À quoi sert PRISME ? » : deux usages, sous la scène. */
  P.renderUsages = function () {
    return h("section", { class: "page usages", "aria-labelledby": "usages-t" },
      h("h2", { id: "usages-t", text: "À quoi sert PRISME ?" }),
      h("div", { class: "use-grid" }, A.usages.map(function (u) {
        return h("article", { class: "card use" },
          h("h3", { text: u.nom }),
          h("p", { text: u.texte }),
          h("p", { class: "use-ex" }, h("span", { class: "lab inline", text: "Exemple · " }), u.exemple));
      })));
  };

  /* ---------- faisceaux, calculés d'après la mise en page ---------- */
  P.drawModelRays = function (scene) {
    if (!scene || !scene.isConnected || !scene._dial) return;
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

    var cards = [].slice.call(scene.querySelectorAll(".rubs .rub")).map(rect);
    var judge = rect(scene.querySelector('[data-anchor="judge"]'));
    var frame = rect(scene.querySelector(".c-b"));
    var n = cards.length;
    var stacked = n > 1 && cards[1].t > cards[0].b - 2;
    cards.forEach(function (c, j) {
      var color = P.rays[j];
      var spread = (j - (n - 1) / 2) * 4;
      var d;
      if (!stacked) {
        d = curveV({ x: ex.x + spread, y: ex.y }, { x: c.cx, y: c.t + 1 });
        path(d, "ray-glow", color); path(d, "ray-core", color);
        var tx = judge.l + 24 + (judge.w - 48) * (j + 0.5) / n;
        var d2 = curveV({ x: c.cx, y: c.b - 1 }, { x: tx, y: judge.t + 1 });
        path(d2, "ray-glow", color); path(d2, "ray-core thin", color);
      } else {
        /* téléphone : un couloir à gauche des rubriques, puis jusqu'au jugement */
        var lane = frame.l + 10 + j * 5;
        var ty = c.t + 20;
        var y1 = Math.max(ex.y + 10, frame.t - 24 + j * 5);
        var x0 = ex.x + spread;
        d = "M" + x0 + " " + ex.y + " L " + x0 + " " + (y1 - 10) +
          " Q " + x0 + " " + y1 + ", " + (x0 - 10) + " " + y1 +
          " L " + (lane + 10) + " " + y1 + " Q " + lane + " " + y1 + ", " + lane + " " + (y1 + 10) +
          " L " + lane + " " + (ty - 8) + " Q " + lane + " " + ty + ", " + (lane + 8) + " " + ty + " L " + (c.l + 2) + " " + ty;
        path(d, "ray-glow", color); path(d, "ray-core", color);
        var jy = judge.t + 18 + j * 6;
        var dd = "M" + lane + " " + ty + " L " + lane + " " + (jy - 8) + " Q " + lane + " " + jy + ", " + (lane + 8) + " " + jy + " L " + (judge.l + 2) + " " + jy;
        path(dd, "ray-core thin", color);
      }
    });
  };
})();
