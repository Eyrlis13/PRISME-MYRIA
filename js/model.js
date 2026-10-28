/*
 * Accueil : la chaîne Conception de la valeur sociale → Garantie du jugement →
 * Spécification du critère en quatre volets → Affirmation de valeur et son issue.
 * Le choix d'une conception (prisme ou boutons) actualise les formulations des quatre volets
 * sans reconstruire la page : les volets dépliés le restent.
 */
(function () {
  var P = window.PRISME;
  var C = P.C;
  var A = C.accueil;
  var h = P.h;
  var U = P.comp;
  var NS = "http://www.w3.org/2000/svg";

  /* Texte de la carte « Garantie du jugement » : brief v2, section 2. */
  var GARANTIE = "La conception, précisée par sa référence de valeur, est ce qui autorise à passer des appuis à l’affirmation. Elle fixe les quatre volets.";
  var INITIALE = "S";

  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function lex(terme) { return C.lexique.filter(function (l) { return l[0] === terme; })[0]; }
  function kicker(n, text, id, dark) {
    return h("h3", { class: "chain-k" + (dark ? " dark" : ""), id: id }, h("span", { class: "chain-n", text: String(n) }), text);
  }

  /*
   * state : { conception: "M"|"I"|"S"|"V"|"N" }
   * api : { setConception(id) }
   */
  P.renderModel = function (state, api) {
    if (!state.conception) state.conception = INITIALE;
    var scene = h("section", { class: "optic model", id: "model", "aria-labelledby": "page-title" });
    scene.appendChild(svgEl("svg", { class: "rays-overlay", "aria-hidden": "true" }));
    var inner = h("div", { class: "wrap model-inner" });
    scene.appendChild(inner);

    inner.appendChild(h("header", { class: "m-head" },
      h("h2", { id: "page-title", text: A.titre }),
      h("p", { class: "m-lead", text: A.sous_titre }),
      h("p", { class: "m-statement" }, h("span", { class: "lab inline", text: "Le modèle · " }), A.enonce_modele)));

    var chain = h("div", { class: "chain" });

    /* 1. Conception de la valeur sociale */
    var blockA = h("section", { class: "c-a", "aria-labelledby": "chain-1" });
    var choose = h("div", { class: "c-choose" }, kicker(1, A.chaine[0], "chain-1"));
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
      h("a", { href: typo.url, target: "_blank", rel: "noopener noreferrer", class: "light" }, P.refLabel(typo))));

    var prismCol = h("div", { class: "c-prism" },
      h("span", { class: "lamp-glow", "data-anchor": "lamp", "aria-hidden": "true" }));
    var dial = P.createDial({
      uid: "m", conceptions: P.conceptions, conceptionId: state.conception, rays: P.rays, initial: INITIALE,
      name: "Prisme des cinq conceptions de la valeur sociale",
      onChange: function (id) { select(id, false); },
    });
    prismCol.appendChild(dial.el);
    blockA.appendChild(choose);
    blockA.appendChild(h("p", { class: "c-meta", text: A.metaphore }));
    blockA.appendChild(prismCol);
    chain.appendChild(blockA);

    /* 2. Garantie du jugement */
    var g = lex("Garantie");
    chain.appendChild(h("section", { class: "c-g", "aria-labelledby": "chain-2" },
      h("div", { class: "guarantee", "data-anchor": "guarantee" },
        kicker(2, A.chaine[1], "chain-2", true),
        h("p", { class: "g-t", text: GARANTIE }),
        h("details", { class: "more" }, h("summary", { text: "Définition" }),
          h("p", null, g[1], h("span", { class: "muted", text: " (" + g[2] + ")" }))))));

    /* 3. Spécification du critère en quatre volets */
    var blockB = h("section", { class: "c-b frame", "aria-labelledby": "chain-3" });
    blockB.appendChild(h("div", { class: "c-b-head" }, kicker(3, A.chaine[2], "chain-3")));
    var vol = h("ol", { class: "rubs" });
    var formulations = {};
    P.volets.forEach(function (v, i) {
      var col = P.colors[v.id];
      var fEl = h("p", { class: "rub-f" });
      formulations[v.id] = fEl;
      vol.appendChild(h("li", { class: "rub", "data-v": v.id, style: "--dim:" + col.ray + ";--dim-tint:" + col.tint },
        h("h4", { class: "rub-t" }, h("span", { class: "dot", "aria-hidden": "true" }), v.intitule),
        h("p", { class: "rub-term", text: v.terme }),
        fEl,
        h("details", { class: "rub-more" }, h("summary", { text: "Question et définition" }),
          h("p", { class: "rub-q", text: v.question }),
          h("p", { text: v.definition }))));
      if (i < P.volets.length - 1) vol.appendChild(h("li", { class: "rub-arrow", "aria-hidden": "true" }, h("span", { text: "→" })));
    });
    blockB.appendChild(vol);
    chain.appendChild(blockB);

    /* 4. Affirmation de valeur et son issue */
    chain.appendChild(h("section", { class: "c-c", "aria-labelledby": "chain-4" },
      h("div", { class: "judge-card", "data-anchor": "judge" },
        kicker(4, A.chaine[3], "chain-4", true),
        h("p", { class: "judge-out", text: C.issues.definition }),
        U.issueKeys("home"))));
    inner.appendChild(chain);

    /* le résultat, lisible sans cliquer */
    inner.appendChild(h("p", { class: "result" }, h("span", { class: "lab inline", text: "Résultat · " }), A.resultat_en_une_phrase));

    inner.appendChild(h("aside", { class: "dossier-band" },
      h("p", { class: "db-k", text: "Dossier commun" }),
      h("p", { class: "db-t", text: A.dossier })));

    inner.appendChild(h("div", { class: "m-cta" },
      h("a", { class: "btn cta", href: "#/illustrations", id: "to-illustrations", text: A.cta_illustrations }),
      h("a", { class: "btn cta alt", href: "#/rapports", id: "to-rapports", text: A.cta_rapports })));

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
      P.volets.forEach(function (v) { formulations[v.id].textContent = c.volets[v.id]; });
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
      h("div", { class: "use-grid" }, C.usages.map(function (u) {
        return h("article", { class: "card use" }, h("h3", { text: u.nom }), h("p", { text: u.texte }));
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

    /* du prisme à la garantie : le faisceau décomposé entre dans la carte */
    var gar = rect(scene.querySelector('[data-anchor="guarantee"]'));
    var n = P.rays.length;
    P.rays.forEach(function (color, j) {
      var spread = (j - (n - 1) / 2) * 4;
      var d = curveV({ x: ex.x + spread, y: ex.y }, { x: gar.cx + spread * 2, y: gar.t + 1 });
      path(d, "ray-glow", color); path(d, "ray-core", color);
    });
    var gx = gar.cx, gy = gar.b - 1;

    var cards = [].slice.call(scene.querySelectorAll(".rubs .rub")).map(rect);
    var judge = rect(scene.querySelector('[data-anchor="judge"]'));
    var frame = rect(scene.querySelector(".c-b"));
    var stacked = cards.length > 1 && cards[1].t > cards[0].b - 2;
    cards.forEach(function (c, j) {
      var color = P.rays[j];
      var spread = (j - (n - 1) / 2) * 8;
      var d;
      if (!stacked) {
        d = curveV({ x: gx + spread, y: gy }, { x: c.cx, y: c.t + 1 });
        path(d, "ray-glow", color); path(d, "ray-core", color);
        var tx = judge.l + 24 + (judge.w - 48) * (j + 0.5) / n;
        var d2 = curveV({ x: c.cx, y: c.b - 1 }, { x: tx, y: judge.t + 1 });
        path(d2, "ray-glow", color); path(d2, "ray-core thin", color);
      } else {
        /* téléphone : un couloir à gauche des volets, puis jusqu'à l'issue */
        var lane = frame.l + 10 + j * 5;
        var ty = c.t + 20;
        var y1 = Math.max(gy + 12, frame.t - 24 + j * 5);
        var x0 = gx + spread / 2;
        d = "M" + x0 + " " + gy + " L " + x0 + " " + (y1 - 10) +
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
