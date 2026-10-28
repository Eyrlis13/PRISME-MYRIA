/* Orchestration : état, routage, rendu des trois pages, redessin des faisceaux. */
(function () {
  var P = window.PRISME;
  var h = P.h;
  var U = P.comp;

  var NOTICE = "Ce lien renvoie à une version antérieure de PRISME. Les anciens cas ont été retirés du parcours lors de la mise à jour du 22 octobre 2026.";

  var state = {
    tab: "modele",
    notice: null,
    model: { conception: null },
    illus: { version: "A", pair: P.IL.couple_initial.slice(), open: {} },
    rapports: { id: null, pair: null, open: {}, dossierOpen: false },
  };
  var app = document.getElementById("app");
  var current = null; /* { kind, el } */
  var rapports = null;

  /* Routes : #/, #/illustrations, #/rapports et #/rapports/<id>. Tout autre lien (anciens cas, anciennes rubriques)
     mène à l'entrée de la page correspondante, avec une indication de la mise à jour. */
  function route() {
    var hash = location.hash || "";
    var prev = state.tab;
    var m = /^#\/rapports(?:\/([a-z0-9-]+))?$/.exec(hash);
    var tab = m ? "rapports" : /^#\/illustrations(?=$|[/?])/.test(hash) ? "illustrations" : /^#\/rapports/.test(hash) ? "rapports" : "modele";
    var known = hash === "" || hash === "#" || hash === "#/" || hash === "#/illustrations" || !!m;
    state.notice = known ? null : NOTICE;
    if (!known && history.replaceState) history.replaceState(null, "", "#/" + (tab === "modele" ? "" : tab));
    state.tab = tab;
    if (tab === "illustrations" && prev !== tab) {
      state.illus.version = "A";
      state.illus.open = {};
    }
    if (tab === "rapports") {
      var id = m && m[1] ? m[1] : null;
      if (prev !== tab || (id && id !== state.rapports.id)) {
        state.rapports.id = id;
        state.rapports.pair = null;
        state.rapports.open = {};
        state.rapports.dossierOpen = false;
      }
    }
    render();
    if (prev !== state.tab) window.scrollTo(0, 0);
  }

  function renderNav() {
    var nav = document.getElementById("nav");
    nav.textContent = "";
    [["modele", "#/", "Modèle conceptuel"], ["illustrations", "#/illustrations", "Illustrations"], ["rapports", "#/rapports", "Rapports"]].forEach(function (t) {
      nav.appendChild(h("a", { href: t[1], class: "tab" + (state.tab === t[0] ? " on" : ""), "aria-current": state.tab === t[0] ? "page" : null, text: t[2] }));
    });
    nav.appendChild(h("button", { type: "button", class: "tab src", id: "nav-sources", onclick: U.openSources, text: "Sources" }));
  }

  /* Rendre de nouveau en gardant la position de lecture et le focus sur le contrôle actionné. */
  function rerender(focusSel) {
    var y = window.scrollY;
    render();
    window.scrollTo(0, y);
    var t = focusSel && document.querySelector(focusSel);
    if (t) t.focus({ preventScroll: true });
  }
  function setPair(pair, side, id) {
    if (pair[1 - side] === id) return;
    pair[side] = id;
  }

  var modelApi = { setConception: function (id) { state.model.conception = id; } };

  var illusApi = {
    setVersion: function (id) {
      state.illus.version = id;
      state.notice = null;
      render();
      /* le dossier est l'endroit où le changement se lit : on y amène la lecture et le focus */
      var dos = document.getElementById("dossier");
      if (dos) {
        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (dos.getBoundingClientRect().top < 0) dos.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
        dos.focus({ preventScroll: true });
      }
    },
    setPair: function (side, id) {
      setPair(state.illus.pair, side, id);
      rerender('.r-card[data-side="' + side + '"] .pk-btn[data-c="' + id + '"]');
    },
  };

  var rapportsApi = {
    setRapport: function (id) {
      if (history.replaceState) history.replaceState(null, "", "#/rapports/" + id);
      state.rapports.id = id;
      state.rapports.pair = null;
      state.rapports.open = {};
      state.rapports.dossierOpen = false;
      rerender("#rapport-select");
    },
    setPair: function (side, id) {
      setPair(state.rapports.pair, side, id);
      rerender('.rp-pickers .picker:nth-child(' + (side + 1) + ') .pk-btn[data-c="' + id + '"]');
    },
  };

  function render() {
    renderNav();
    U.closeDrawer(true);
    app.textContent = "";
    if (state.notice) app.appendChild(h("p", { class: "notice wrap", role: "status", text: state.notice }));
    if (state.tab === "modele") {
      var scene = P.renderModel(state.model, modelApi);
      app.appendChild(scene);
      app.appendChild(P.renderUsages());
      current = { kind: "model", el: scene };
    } else if (!rapports) {
      app.appendChild(h("p", { class: "loading wrap", role: "status", text: "Chargement…" }));
      current = null;
      P.loadRapports().then(function (r) { rapports = r; render(); });
      return;
    } else if (state.tab === "illustrations") {
      var page = P.renderIllustrations(state.illus, illusApi, rapports);
      app.appendChild(page);
      current = { kind: "illus", el: page };
    } else {
      var rp = P.renderRapports(state.rapports, rapportsApi, rapports);
      app.appendChild(rp);
      current = { kind: "rapports", el: rp };
    }
    requestAnimationFrame(redraw);
  }

  function redraw() {
    if (!current) return;
    if (current.kind === "model") P.drawModelRays(current.el);
    else if (current.kind === "illus") P.drawIllusRays(current.el);
  }
  P.redraw = redraw;
  window.addEventListener("resize", function () { requestAnimationFrame(redraw); });
  document.addEventListener("toggle", function () { requestAnimationFrame(redraw); }, true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(redraw); });

  document.getElementById("foot-sources").addEventListener("click", U.openSources);
  window.addEventListener("hashchange", route);
  route();
})();
