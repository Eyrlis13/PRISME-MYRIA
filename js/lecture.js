/*
 * Panneau de lecture : un prisme orientable et la lecture qu'il donne d'une revendication.
 * Utilisé par l'illustration et par les rapports. Chaque panneau a son propre prisme.
 * lectures : { M: lecture, I: lecture, S: lecture, V: lecture|{options}, N: lecture|{options} }
 * lecture : { garantie: {raison, portee, preuves, regle}, verdict, manque, integre, statut_croisement? }
 */
(function () {
  var P = window.PRISME;
  var C = P.C, L = C.libelles;
  var h = P.h;

  function copy(text, btn) {
    function done() { var t = btn.textContent; btn.textContent = "Copié"; setTimeout(function () { btn.textContent = t; }, 1400); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
    else { var ta = h("textarea", null, text); document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) {} ta.remove(); }
  }

  /*
   * opts : { uid, lectures, conception, option, writable (bool), request(cid, texte) → string,
   *          onChange(cid, optionId) }
   */
  P.lecturePanel = function (opts) {
    var state = { cid: opts.conception, opt: opts.option || null, other: "" };
    var col = h("div", { class: "lp", "data-panel": opts.uid });
    var dialBox = h("div", { class: "lp-dial", "data-anchor": "dial-" + opts.uid });
    var dial = P.createDial({
      uid: "lp" + opts.uid, conceptions: P.conceptions, conceptionId: state.cid, rays: P.rays,
      name: "Prisme de la lecture " + opts.uid,
      onChange: function (id) { state.cid = id; state.opt = null; render(); if (opts.onChange) opts.onChange(id, null); },
    });
    dialBox.appendChild(dial.el);
    var card = h("article", { class: "r-card lp-card", "aria-live": "polite" });
    col.appendChild(dialBox); col.appendChild(card);

    function current() {
      var l = opts.lectures[state.cid];
      if (!l) return null;
      if (!l.options) return l;
      if (state.opt === "__autre__") return null;
      var o = l.options.filter(function (x) { return x.id === state.opt; })[0] || l.options[0];
      state.opt = o.id;
      return o;
    }

    function render() {
      card.textContent = "";
      var c = P.conception(state.cid);
      var l = opts.lectures[state.cid];
      card.appendChild(h("header", { class: "rc-head" },
        P.miniPrism(state.cid, P.rays),
        h("div", null, h("h3", { class: "rc-name", text: c.nom }), h("p", { class: "rc-reason", text: c.raison_courte }))));
      var body = h("div", { class: "rc-body" });
      card.appendChild(body);
      if (l && l.statut_croisement && l.statut_croisement !== "Proposed") {
        body.appendChild(h("p", { class: "lp-tag", text: "Spécification " + P.statut(l.statut_croisement).nom.toLowerCase() }));
      }
      if (l && l.options) {
        var sel = h("select", { class: "lp-select", "aria-label": state.cid === "N" ? "Principe invoqué" : "Obligation invoquée",
          onchange: function () { state.opt = sel.value; render(); if (opts.onChange) opts.onChange(state.cid, state.opt); } },
          l.options.map(function (o) { return h("option", { value: o.id, text: o.libelle + (o.source ? " · " + o.source : "") }); }),
          opts.writable ? h("option", { value: "__autre__", text: L.autre }) : null);
        if (!state.opt) state.opt = l.options[0].id;
        sel.value = state.opt;
        body.appendChild(h("p", { class: "out-k", text: state.cid === "N" ? "Principe invoqué" : "Obligation invoquée" }));
        body.appendChild(sel);
      }
      var r = current();
      if (!r) {
        if (state.opt === "__autre__") {
          var ta = h("textarea", { class: "lp-write", rows: "3", placeholder: state.cid === "N" ? "Énoncer le principe…" : "Énoncer l'obligation…" });
          ta.value = state.other;
          var req = h("pre", { class: "lp-req" });
          var btn = h("button", { type: "button", class: "btn small", text: "Copier la demande", onclick: function () { copy(req.textContent, btn); } });
          function upd() { state.other = ta.value; req.textContent = opts.request(state.cid, ta.value.trim() || "…"); }
          ta.addEventListener("input", upd); upd();
          body.appendChild(ta);
          body.appendChild(h("p", { class: "out-k", text: C.rapports.demande_claude }));
          body.appendChild(req); body.appendChild(btn);
        }
        return;
      }
      if (r.verdict === "ouvert") {
        body.appendChild(h("p", { class: "vchip big v-ouvert", text: "Croisement ouvert" }));
        body.appendChild(h("p", { class: "out-why", text: r.manque }));
        return;
      }
      var v = P.verdict(r.verdict);
      body.appendChild(h("p", { class: "out-k", text: L.verdict }));
      body.appendChild(h("p", { class: "vchip big v-" + r.verdict, text: v.nom }));
      body.appendChild(h("p", { class: "out-k", text: L.manque }));
      body.appendChild(h("p", { class: "out-why", text: r.manque }));
      if (r.pour_etayer && r.pour_etayer.verdict_vise) {
        body.appendChild(h("div", { class: "lp-guide" },
          h("p", { class: "out-k", text: L.pour_etayer }),
          h("p", { class: "out-why", text: r.pour_etayer.texte }),
          h("p", { class: "lp-to" }, "→ ", L.deviendrait, " ", h("span", { class: "vchip v-" + r.pour_etayer.verdict_vise, text: P.verdict(r.pour_etayer.verdict_vise).nom.toLowerCase() }))));
      } else if (r.pour_etayer && r.pour_etayer.texte && r.pour_etayer.texte !== "Rien pour cette portée." && r.pour_etayer.texte !== "—") {
        body.appendChild(h("div", { class: "lp-guide" }, h("p", { class: "out-k", text: L.pour_etayer }), h("p", { class: "out-why", text: r.pour_etayer.texte })));
      }
      body.appendChild(h("p", { class: "out-k", text: L.integre }));
      body.appendChild(h("p", { class: "out-main" }, r.integre, " ", h("span", { class: "vchip mini v-etayee", text: "étayée" })));
      var g = r.garantie;
      var det = h("details", { class: "more reasoning" }, h("summary", { text: L.garantie }),
        h("ul", { class: "r-rubs" }, P.composantes.map(function (f) {
          var col = P.colors[f.id];
          return h("li", { style: "--dim:" + col.ray + ";--dim-tint:" + col.tint },
            h("span", { class: "rr-k" }, h("span", { class: "dot", "aria-hidden": "true" }), f.terme),
            h("span", { class: "rr-t", text: g[f.id] }));
        })));
      if (opts.openGarantie) det.open = true;
      det.addEventListener("toggle", function () { opts.openGarantie = det.open; if (P.redraw) requestAnimationFrame(P.redraw); });
      card.appendChild(det);
    }
    render();
    return {
      el: col, dial: dial,
      state: state,
      setLectures: function (lectures) { opts.lectures = lectures; render(); },
    };
  };

  /* Traits couleur papier du dossier vers chaque prisme. */
  P.drawDossierLines = function (scene) {
    if (!scene || !scene.isConnected) return;
    var svg = scene.querySelector(".rays-overlay");
    var box = scene.getBoundingClientRect();
    svg.setAttribute("width", box.width); svg.setAttribute("height", box.height);
    svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var dosEl = scene.querySelector('[data-anchor="dossier"]');
    var dials = [].slice.call(scene.querySelectorAll(".lp-dial"));
    if (!dosEl || dials.length < 2) return;
    function rect(el) { var r = el.getBoundingClientRect(); return { l: r.left - box.left, t: r.top - box.top, b: r.bottom - box.top, cx: (r.left + r.right) / 2 - box.left }; }
    var dos = rect(dosEl);
    var a = rect(dials[0]), b = rect(dials[1]);
    if (b.t > a.b - 2) dials = dials.slice(0, 1);
    dials.forEach(function (el) {
      var c = rect(el);
      var p0 = { x: dos.cx, y: dos.b }, p1 = { x: c.cx, y: c.t + 34 };
      var my = (p0.y + p1.y) / 2;
      var e = document.createElementNS("http://www.w3.org/2000/svg", "path");
      e.setAttribute("class", "dossier-line");
      e.setAttribute("d", "M" + p0.x + " " + p0.y + " C " + p0.x + " " + my + ", " + p1.x + " " + my + ", " + p1.x + " " + p1.y);
      svg.appendChild(e);
    });
  };
})();
