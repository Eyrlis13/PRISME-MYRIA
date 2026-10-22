/* Orchestration : état, routage, rendu des deux pages, redessin des faisceaux. */
(function () {
  var P = window.PRISME;
  var C = P.C;
  var h = P.h;
  var U = P.comp;

  var NOTICE = "Ce lien renvoie à une version antérieure de PRISME. Les anciens cas ont été retirés du parcours lors de la mise à jour du 22 octobre 2026.";

  var state = {
    tab: "modele",
    notice: null,
    model: { conception: C.accueil.conception_initiale },
    illus: { version: C.illustrations.version_initiale, open: {} },
  };
  var app = document.getElementById("app");
  var current = null; /* { kind, el } */

  /* Routes prises en charge : #/ et #/illustrations. Tout autre lien (anciens cas, anciennes rubriques)
     mène à l'entrée de la page correspondante, avec une indication de la mise à jour. */
  function route() {
    var hash = location.hash || "";
    var prev = state.tab;
    var tab = /^#\/illustrations(?=$|[/?])/.test(hash) ? "illustrations" : "modele";
    var known = hash === "" || hash === "#" || hash === "#/" || hash === "#/illustrations";
    state.notice = known ? null : NOTICE;
    if (!known && history.replaceState) history.replaceState(null, "", tab === "illustrations" ? "#/illustrations" : "#/");
    state.tab = tab;
    if (tab === "illustrations" && prev !== tab) {
      state.illus.version = C.illustrations.version_initiale;
      state.illus.open = {};
    }
    render();
    if (prev !== state.tab) window.scrollTo(0, 0);
  }

  function renderNav() {
    var nav = document.getElementById("nav");
    nav.textContent = "";
    [["modele", "#/", "Modèle conceptuel"], ["illustrations", "#/illustrations", "Illustrations"]].forEach(function (t) {
      nav.appendChild(h("a", { href: t[1], class: "tab" + (state.tab === t[0] ? " on" : ""), "aria-current": state.tab === t[0] ? "page" : null, text: t[2] }));
    });
    nav.appendChild(h("button", { type: "button", class: "tab src", id: "nav-sources", onclick: U.openSources, text: "Sources" }));
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
  };

  function render() {
    renderNav();
    U.closeDrawer(true);
    app.textContent = "";
    if (state.notice) app.appendChild(h("p", { class: "notice wrap", role: "status", text: state.notice }));
    if (state.tab === "illustrations") {
      var page = P.renderIllustrations(state.illus, illusApi);
      app.appendChild(page);
      current = { kind: "illus", el: page };
    } else {
      var scene = P.renderModel(state.model, modelApi);
      app.appendChild(scene);
      app.appendChild(P.renderUsages());
      current = { kind: "model", el: scene };
    }
    requestAnimationFrame(redraw);
  }

  function redraw() {
    if (!current) return;
    if (current.kind === "model") P.drawModelRays(current.el);
    else P.drawIllusRays(current.el);
  }
  P.redraw = redraw;
  window.addEventListener("resize", function () { requestAnimationFrame(redraw); });
  document.addEventListener("toggle", function () { requestAnimationFrame(redraw); }, true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(redraw); });

  document.getElementById("foot-sources").addEventListener("click", U.openSources);
  window.addEventListener("hashchange", route);
  route();
})();
