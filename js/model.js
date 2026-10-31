/*
 * Accueil : Conception de la valeur sociale → Spécification de la garantie → Verdict.
 * Le prisme (ou les boutons) choisit la conception ; le sélecteur choisit le domaine de critères.
 * Les quatre cartes affichent la spécification du croisement (conception × domaine), ses appuis,
 * et la carte du verdict sa réfutation. Rien n'est reconstruit : les cartes dépliées le restent.
 */
(function () {
  var P = window.PRISME;
  var C = P.C;
  var A = C.accueil;
  var h = P.h;
  var NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  /* Liste des appuis d'une composante. */
  P.appuisList = function (comp) {
    var items = (comp.appuis || []).map(function (a) {
      return h("li", null,
        a.doi ? h("a", { href: "https://doi.org/" + a.doi, target: "_blank", rel: "noopener noreferrer", text: a.source + ", " + a.loc }) : h("span", { text: a.source + ", " + a.loc }),
        h("span", { class: "ap-what", text: " · " + a.ce_que }));
    });
    return [
      h("p", { class: "ap-nat" }, "Nature : ", (comp.nature || []).map(P.nature).join(" + ")),
      items.length ? h("ul", { class: "ap-list" }, items) : h("p", { class: "ap-none", text: "Aucun passage : dérivation à partir de la raison de valoriser et de la portée." }),
    ];
  };

  /*
   * state : { conception: "M"|"I"|"S"|"V"|"N", domaine: "D01".."D11" }
   * api : { setConception(id), setDomaine(id) }
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

    /* A. Conception de la valeur sociale */
    var blockA = h("section", { class: "c-a", "aria-labelledby": "chain-a" });
    var choose = h("div", { class: "c-choose" },
      h("h3", { class: "chain-k", id: "chain-a" }, h("span", { class: "chain-n", text: "A" }), A.chaine[0]));
    var list = h("ul", { class: "c-list", role: "list" });
    var buttons = {};
    var reason = h("p", { class: "c-reason", id: "c-reason", "aria-live": "polite" });
    C.conceptions.forEach(function (c) {
      var b = h("button", { type: "button", class: "c-btn", "data-c": c.id, "aria-pressed": "false",
        onclick: function () { select(c.id, true); } }, c.nom);
      buttons[c.id] = b;
      list.appendChild(h("li", null, b));
    });
    choose.appendChild(list);
    var typo = P.ref("DCJ2025");
    choose.appendChild(h("p", { class: "c-src" }, "Typologie : ",
      h("a", { href: typo.url, target: "_blank", rel: "noopener noreferrer", class: "light" }, typo.court)));

    var prismCol = h("div", { class: "c-prism" },
      h("span", { class: "lamp-glow", "data-anchor": "lamp", "aria-hidden": "true" }));
    var dial = P.createDial({
      uid: "m", conceptions: P.conceptions, conceptionId: state.conception, rays: P.rays, initial: A.conception_initiale,
      name: "Prisme des cinq conceptions de la valeur sociale",
      onChange: function (id) { select(id, false); },
    });
    prismCol.appendChild(dial.el);
    blockA.appendChild(choose);
    blockA.appendChild(prismCol);
    chain.appendChild(blockA);

    /* B. Spécification de la garantie, pour un domaine de critères */
    var blockB = h("section", { class: "c-b frame", "aria-labelledby": "chain-b" });
    var sel = h("select", { class: "dom-select", id: "dom-select", "aria-label": "Domaine de critères",
      onchange: function () { setDomaine(sel.value); } },
      C.domaines.map(function (d) { return h("option", { value: d.id, text: d.nom }); }));
    var domDef = h("p", { class: "dom-def" });
    var stChip = h("p", { class: "st-chip" });
    var question = h("p", { class: "dom-q" });
    blockB.appendChild(h("div", { class: "c-b-head" },
      h("h3", { class: "chain-k", id: "chain-b" }, h("span", { class: "chain-n", text: "B" }), A.chaine[1]),
      h("label", { class: "dom-lab", for: "dom-select", text: "Domaine de critères" }), sel, domDef, stChip, question,
      h("p", { class: "c-note", text: A.note_composantes })));
    var rubs = h("ol", { class: "rubs" });
    var formulations = {}, appuis = {};
    P.composantes.forEach(function (f, i) {
      var col = P.colors[f.id];
      var fEl = h("p", { class: "rub-f" });
      var apEl = h("div", { class: "rub-ap" });
      formulations[f.id] = fEl; appuis[f.id] = apEl;
      rubs.appendChild(h("li", { class: "rub", "data-f": f.id, style: "--dim:" + col.ray + ";--dim-tint:" + col.tint },
        h("h4", { class: "rub-t" }, h("span", { class: "dot", "aria-hidden": "true" }), f.intitule),
        h("p", { class: "rub-term", text: f.terme }),
        fEl,
        h("details", { class: "rub-more" }, h("summary", { text: "Appuis" }),
          h("p", { class: "rub-q", text: f.explication }), apEl)));
      if (i < P.composantes.length - 1) rubs.appendChild(h("li", { class: "rub-arrow", "aria-hidden": "true" }, h("span", { text: "→" })));
    });
    blockB.appendChild(rubs);
    chain.appendChild(blockB);

    /* C. Verdict sur la revendication */
    var refut = h("p", { class: "judge-ref" });
    chain.appendChild(h("section", { class: "c-c", "aria-labelledby": "chain-c" },
      h("div", { class: "judge-card", "data-anchor": "judge" },
        h("h3", { class: "chain-k dark", id: "chain-c" }, h("span", { class: "chain-n", text: "C" }), A.chaine[2]),
        h("p", { class: "judge-out", text: A.verdict_intro }),
        h("ul", { class: "v-list" }, C.verdicts.map(function (v) {
          return h("li", { class: "v-item" }, h("span", { class: "vchip v-" + v.id, text: v.nom }), h("span", { class: "v-def", text: v.definition }));
        })),
        h("div", { class: "judge-foot" }, h("p", { class: "lab", text: C.refutation.terme }), refut))));
    inner.appendChild(chain);

    /* dossier commun */
    inner.appendChild(h("aside", { class: "dossier-band" },
      h("p", { class: "db-k", text: "Dossier commun" }),
      h("p", { class: "db-t", text: A.dossier_commun }),
      h("details", { class: "more" }, h("summary", { text: "Détail" }), h("p", { text: A.detail_dossier }))));

    inner.appendChild(h("div", { class: "m-cta" },
      h("a", { class: "btn cta", href: "#/illustration", id: "to-illustration", text: A.cta })));

    function fill() {
      var s = P.spec(state.conception, state.domaine);
      var d = P.domaine(state.domaine);
      var st = P.statut(s.statut);
      domDef.textContent = d.definition;
      stChip.textContent = "Spécification " + st.nom.toLowerCase();
      stChip.className = "st-chip st-" + s.statut.toLowerCase();
      stChip.title = st.definition;
      question.textContent = s.question ? "« " + s.question + " »" : "";
      P.composantes.forEach(function (f) {
        var comp = s[f.id];
        formulations[f.id].textContent = comp.texte;
        appuis[f.id].textContent = "";
        P.appuisList(comp).forEach(function (n) { appuis[f.id].appendChild(n); });
      });
      refut.textContent = s.refutation.texte;
      scene.classList.toggle("is-open", s.statut === "Open");
    }
    function setDomaine(id) {
      state.domaine = id; sel.value = id;
      if (api && api.setDomaine) api.setDomaine(id);
      fill();
      requestAnimationFrame(function () { P.drawModelRays(scene); });
    }
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
      fill();
      if (rotate) dial.rotateTo(id);
      if (api && api.setConception) api.setConception(id);
      requestAnimationFrame(function () { P.drawModelRays(scene); });
    }
    sel.value = state.domaine;
    select(state.conception, false);

    scene._dial = dial;
    return scene;
  };

  /* Sous la scène : usages, propositions, intégrité inférentielle. */
  P.renderUsages = function () {
    return h("div", null,
      h("section", { class: "page props", "aria-labelledby": "props-t" },
        h("h2", { id: "props-t", text: "Trois propositions" }),
        h("div", { class: "prop-grid" }, A.propositions.map(function (p) {
          return h("article", { class: "card prop" }, h("p", { class: "prop-id", text: p.id }), h("h3", { text: p.titre }), h("p", { text: p.texte }));
        })),
        h("p", { class: "integ" }, h("span", { class: "lab inline", text: "Intégrité inférentielle · " }), A.integrite)),
      h("section", { class: "page usages", "aria-labelledby": "usages-t" },
        h("h2", { id: "usages-t", text: "À quoi sert PRISME ?" }),
        h("div", { class: "use-grid" }, A.usages.map(function (u) {
          return h("article", { class: "card use" },
            h("h3", { text: u.nom }),
            h("p", { text: u.texte }),
            h("p", { class: "use-ex" }, h("span", { class: "lab inline", text: "Exemple · " }), u.exemple));
        }))));
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
    var open = scene.classList.contains("is-open");
    var stacked = n > 1 && cards[1].t > cards[0].b - 2;
    cards.forEach(function (c, j) {
      var color = P.rays[j];
      var spread = (j - (n - 1) / 2) * 4;
      var cls = open && j > 0 ? " faint" : "";
      var d;
      if (!stacked) {
        d = curveV({ x: ex.x + spread, y: ex.y }, { x: c.cx, y: c.t + 1 });
        path(d, "ray-glow" + cls, color); path(d, "ray-core" + cls, color);
        var tx = judge.l + 24 + (judge.w - 48) * (j + 0.5) / n;
        var d2 = curveV({ x: c.cx, y: c.b - 1 }, { x: tx, y: judge.t + 1 });
        path(d2, "ray-glow" + cls, color); path(d2, "ray-core thin" + cls, color);
      } else {
        var lane = frame.l + 10 + j * 5;
        var ty = c.t + 20;
        var y1 = Math.max(ex.y + 10, frame.t - 24 + j * 5);
        var x0 = ex.x + spread;
        d = "M" + x0 + " " + ex.y + " L " + x0 + " " + (y1 - 10) +
          " Q " + x0 + " " + y1 + ", " + (x0 - 10) + " " + y1 +
          " L " + (lane + 10) + " " + y1 + " Q " + lane + " " + y1 + ", " + lane + " " + (y1 + 10) +
          " L " + lane + " " + (ty - 8) + " Q " + lane + " " + ty + ", " + (lane + 8) + " " + ty + " L " + (c.l + 2) + " " + ty;
        path(d, "ray-glow" + cls, color); path(d, "ray-core" + cls, color);
        var jy = judge.t + 18 + j * 6;
        var dd = "M" + lane + " " + ty + " L " + lane + " " + (jy - 8) + " Q " + lane + " " + jy + ", " + (lane + 8) + " " + jy + " L " + (judge.l + 2) + " " + jy;
        path(dd, "ray-core thin" + cls, color);
      }
    });
  };
})();
